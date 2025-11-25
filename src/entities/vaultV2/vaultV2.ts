import { DEFAULT_SLIPPAGE_TOLERANCE, MathLib } from "@morpho-org/blue-sdk";
import { fetchAccrualVaultV2, fetchVaultV2 } from "@morpho-org/blue-sdk-viem";
import type { Address } from "viem";
import {
  getRequirements,
  vaultV2Deposit,
  vaultV2Redeem,
  vaultV2Withdraw,
} from "../../actions";
import type {
  ERC20ApprovalAction,
  MorphoClient,
  Transaction,
  VaultV2DepositAction,
  VaultV2RedeemAction,
  VaultV2WithdrawAction,
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
    userAddress?: Address;
    slippageTolerance?: bigint;
  }) => Promise<{
    tx: Readonly<Transaction<VaultV2DepositAction>>;
    getRequirements: () => Promise<
      Readonly<Transaction<ERC20ApprovalAction>[]>
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
  withdraw: (params: { assets: bigint; userAddress?: Address }) => {
    tx: Readonly<Transaction<VaultV2WithdrawAction>>;
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
  redeem: (params: { shares: bigint; userAddress?: Address }) => {
    tx: Readonly<Transaction<VaultV2RedeemAction>>;
  };
}

export class VaultV2 implements VaultV2Actions {
  // You should declare these directly in constructor to avoid wordy asignement
  private readonly client: MorphoClient;
  private readonly vault: Address;

  constructor(client: MorphoClient, vault: Address) {
    this.client = client;
    this.vault = vault;
  }

  // declare a method on the prototype not an arrow function property
  getData = async () => fetchAccrualVaultV2(this.vault, this.client.viemClient);
  // TODO in blue-sdk-viem but i would store blockNumber in the result class

  async deposit({
    assets,
    userAddress,
    slippageTolerance = DEFAULT_SLIPPAGE_TOLERANCE,
  }: {
    assets: bigint;
    userAddress?: Address;
    slippageTolerance?: bigint;
  }) {
    const vaultData = await fetchVaultV2(this.vault, this.client.viemClient);

    const maxSharePrice = MathLib.min(
      MathLib.mulDivUp(
        assets,
        MathLib.wToRay(MathLib.WAD + slippageTolerance),
        vaultData.toShares(assets),
      ),
      MathLib.RAY * 100n,
    );

    // TO be honest, I think the whole bundle should be built at once, without separating approvals and main action
    // I thought that this was what we agreed on
    return {
      tx: vaultV2Deposit({
        vault: {
          chainId: this.client.chainId,
          address: this.vault,
          asset: vaultData.asset,
        },
        args: {
          assets,
          maxSharePrice,
          recipient: userAddress ?? this.client.userAddress, // I don't like this, userAddress should be required and deterministic
        },
        metadata: this.client.metadata,
      }),
      getRequirements: async () =>
        getRequirements(this.client, {
          address: vaultData.asset,
          args: {
            amount: assets,
            from: userAddress ?? this.client.userAddress, // I really don't like having non-deterministic values in auch arrow functions: the value of this.client.userAddress can change in the middle of the execution and thus result in 2 different userAddress for approvals and recipients
            // I could imagine a scenario where tx is built with an address different than mine because i'm currently switching user, it would lead to me signing approvals but sending the tx with a recipient that is not me...
          },
        }),
    };
  }

  withdraw({ assets, userAddress }: { assets: bigint; userAddress?: Address }) {
    return {
      tx: vaultV2Withdraw({
        vault: { address: this.vault },
        args: {
          assets,
          recipient: userAddress ?? this.client.userAddress,
          onBehalf: userAddress ?? this.client.userAddress,
        },
        metadata: this.client.metadata,
      }),
    };
  }

  redeem({ shares, userAddress }: { shares: bigint; userAddress?: Address }) {
    return {
      tx: vaultV2Redeem({
        vault: { address: this.vault },
        args: {
          shares,
          recipient: userAddress ?? this.client.userAddress,
          onBehalf: userAddress ?? this.client.userAddress,
        },
        metadata: this.client.metadata,
      }),
    };
  }
}

// I don't see the interest of this function, this is basically the constructor of VaultV2
export const instantiateVaultV2 = (client: MorphoClient, vault: Address) =>
  new VaultV2(client, vault);
