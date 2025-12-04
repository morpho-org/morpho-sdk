import { DEFAULT_SLIPPAGE_TOLERANCE, MathLib } from "@morpho-org/blue-sdk";
import { fetchAccrualVaultV2, fetchVaultV2 } from "@morpho-org/blue-sdk-viem";
import type { Address } from "viem";
import {
  getRequirements,
  vaultV2Deposit,
  vaultV2Redeem,
  vaultV2Withdraw,
} from "../../actions";
import {
  ChainIdMismatchError,
  type ERC20ApprovalAction,
  type MorphoClientType,
  type Requirement,
  type PermitArgs,
  type Transaction,
  type VaultV2DepositAction,
  type VaultV2RedeemAction,
  type VaultV2WithdrawAction,
  PermitAction,
  Permit2Action,
} from "../../types";

export interface VaultV2Actions {
  /**
   * Fetches the latest vault data.
   *
   * This function fetches the latest vault data from the blockchain.
   *
   * @returns {Promise<Awaited<ReturnType<typeof fetchAccrualVaultV2>>>} The latest vault data.
   */
  getData: () => Promise<Awaited<ReturnType<typeof fetchAccrualVaultV2>>>;
  /**
   * Prepares a deposit transaction for the VaultV2 contract.
   *
   * This function constructs the transaction data required to deposit a specified amount of assets into the vault.
   * The function asynchronously fetches the latest vault data to ensure accurate calculations for slippage and asset address,
   * then returns the prepared deposit transaction and a function for retrieving all required approval transactions.
   * Bundler Integration: This flow uses the bundler to atomically execute the user's asset transfer and vault deposit in a single transaction for slippage protection.
   *
   * @param {Object} params - The deposit parameters.
   * @param {bigint} params.assets - The amount of assets to deposit.
   * @param {Address} [params.userAddress] - Optional user address initiating the deposit. Default is the client's user address is used.
   * @param {bigint} [params.slippageTolerance=DEFAULT_SLIPPAGE_TOLERANCE] - Optional slippage tolerance value. Default is 0.03%.
   * @returns {Object} The result object.
   * @returns {Readonly<Transaction<VaultV2DepositAction>>} returns.tx The prepared deposit transaction.
   * @returns {Promise<Readonly<Transaction<ERC20ApprovalAction>[]>>} returns.getRequirements The function for retrieving all required approval transactions.
   */
  deposit: (params: {
    assets: bigint;
    userAddress: Address;
    slippageTolerance?: bigint;
  }) => Promise<{
    buildTx: () => Readonly<Transaction<VaultV2DepositAction>>;
    getRequirements: () => Promise<
      (Readonly<Transaction<ERC20ApprovalAction>> | Requirement)[]
    >;
  }>;
  /**
   * Prepares a withdraw transaction for the VaultV2 contract.
   *
   * This function constructs the transaction data required to withdraw a specified amount of assets from the vault.
   *
   * @param {Object} params - The withdraw parameters.
   * @param {bigint} params.assets - The amount of assets to withdraw.
   * @param {Address} [params.userAddress] - Optional user address initiating the withdraw.
   * @returns {Object} The result object.
   * @returns {Readonly<Transaction<VaultV2WithdrawAction>>} returns.tx The prepared withdraw transaction.
   */
  withdraw: (params: { assets: bigint; userAddress: Address }) => {
    buildTx: () => Readonly<Transaction<VaultV2WithdrawAction>>;
  };
  /**
   * Prepares a redeem transaction for the VaultV2 contract.
   *
   * This function constructs the transaction data required to redeem a specified amount of shares from the vault.
   *
   * @param {Object} params - The redeem parameters.
   * @param {bigint} params.shares - The amount of shares to redeem.
   * @param {Address} [params.userAddress] - Optional user address initiating the redeem.
   * @returns {Object} The result object.
   * @returns {Readonly<Transaction<VaultV2RedeemAction>>} returns.tx The prepared redeem transaction.
   */
  redeem: (params: { shares: bigint; userAddress: Address }) => {
    buildTx: () => Readonly<Transaction<VaultV2RedeemAction>>;
  };
}

export class MorphoVaultV2 implements VaultV2Actions {
  constructor(
    private readonly client: MorphoClientType,
    private readonly vault: Address,
    private readonly chainId: number,
  ) {}

  async getData() {
    return fetchAccrualVaultV2(this.vault, this.client.viemClient);
  }

  async deposit({
    assets,
    userAddress,
    slippageTolerance = DEFAULT_SLIPPAGE_TOLERANCE,
  }: {
    assets: bigint;
    userAddress: Address;
    slippageTolerance?: bigint;
  }) {
    if (this.client.viemClient.chain?.id !== this.chainId) {
      throw new ChainIdMismatchError(
        this.client.viemClient.chain?.id,
        this.chainId,
      );
    }

    const vaultData = await fetchVaultV2(this.vault, this.client.viemClient);

    const maxSharePrice = MathLib.min(
      MathLib.mulDivUp(
        assets,
        MathLib.wToRay(MathLib.WAD + slippageTolerance),
        vaultData.toShares(assets),
      ),
      MathLib.RAY * 100n,
    );

    const signatures: { args: PermitArgs; action: PermitAction | Permit2Action }[] = [];

    return {
      getRequirements: async () => {
        const requirements = await getRequirements(
          this.client.viemClient,
          {
            address: vaultData.asset,
            chainId: this.chainId,
            args: {
              amount: assets,
              from: userAddress,
            },
          },
          this.client.supportSignature,
        );

        // Wrap each requirement with a sign method that pushes the signature into the signatures array for final execution
        for (const req of requirements) {
          if ("sign" in req && typeof req.sign === "function") {
            const originalSign = req.sign;
            req.sign = async (...args: Parameters<typeof originalSign>) => {
              const sig = await originalSign(...args);
              signatures.push({
                args: sig,
                action: req.action,
              });
              return sig;
            };
          }
        }

        return requirements;
      },
      buildTx: () =>
        vaultV2Deposit({
          vault: {
            chainId: this.chainId,
            address: this.vault,
            asset: vaultData.asset,
          },
          args: {
            assets,
            maxSharePrice,
            recipient: userAddress,
            signatures,
          },
          metadata: this.client.metadata,
        }),
    };
  }

  withdraw({ assets, userAddress }: { assets: bigint; userAddress: Address }) {
    return {
      buildTx: () =>
        vaultV2Withdraw({
          vault: { address: this.vault },
          args: {
            assets,
            recipient: userAddress,
            onBehalf: userAddress,
          },
          metadata: this.client.metadata,
        }),
    };
  }

  redeem({ shares, userAddress }: { shares: bigint; userAddress: Address }) {
    return {
      buildTx: () =>
        vaultV2Redeem({
          vault: { address: this.vault },
          args: {
            shares,
            recipient: userAddress,
            onBehalf: userAddress,
          },
          metadata: this.client.metadata,
        }),
    };
  }
}
