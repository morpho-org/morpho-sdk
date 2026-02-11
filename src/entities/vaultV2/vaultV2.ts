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
  type RequirementSignature,
  type Transaction,
  type VaultV2DepositAction,
  type VaultV2RedeemAction,
  type VaultV2WithdrawAction,
} from "../../types";
import type { FetchParameters } from "../../types/data";

export interface VaultV2Actions {
  /**
   * Fetches the latest vault data.
   *
   * This function fetches the latest vault data from the blockchain.
   * @param {FetchParameters} [parameters] - The parameters for the fetch operation.
   *
   * @returns {Promise<Awaited<ReturnType<typeof fetchAccrualVaultV2>>>} The latest vault data.
   */
  getData: (
    parameters?: FetchParameters,
  ) => Promise<Awaited<ReturnType<typeof fetchAccrualVaultV2>>>;
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
    buildTx: (
      requirementSignature?: RequirementSignature,
    ) => Readonly<Transaction<VaultV2DepositAction>>;
    getRequirements: (params?: {
      useSimplePermit?: boolean;
    }) => Promise<(Readonly<Transaction<ERC20ApprovalAction>> | Requirement)[]>;
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

  async getData(parameters?: FetchParameters) {
    return fetchAccrualVaultV2(this.vault, this.client.viemClient, {
      ...parameters,
      chainId: this.chainId,
      deployless: this.client.options.supportDeployless,
    });
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

    const vaultData = await fetchVaultV2(this.vault, this.client.viemClient, {
      chainId: this.chainId,
      deployless: this.client.options.supportDeployless,
    });

    const maxSharePrice = MathLib.min(
      MathLib.mulDivUp(
        assets,
        MathLib.wToRay(MathLib.WAD + slippageTolerance),
        vaultData.toShares(assets),
      ),
      MathLib.RAY * 100n,
    );

    return {
      getRequirements: async (params?: { useSimplePermit?: boolean }) =>
        await getRequirements(this.client.viemClient, {
          address: vaultData.asset,
          chainId: this.chainId,
          supportSignature: this.client.options.supportSignature,
          supportDeployless: this.client.options.supportDeployless,
          useSimplePermit: params?.useSimplePermit,
          args: {
            amount: assets,
            from: userAddress,
          },
        }),
      buildTx: (requirementSignature?: RequirementSignature) =>
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
            requirementSignature,
          },
          metadata: this.client.options.metadata,
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
          metadata: this.client.options.metadata,
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
          metadata: this.client.options.metadata,
        }),
    };
  }
}
