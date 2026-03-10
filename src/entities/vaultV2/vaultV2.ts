import { DEFAULT_SLIPPAGE_TOLERANCE, MathLib } from "@morpho-org/blue-sdk";
import { fetchAccrualVaultV2, fetchVaultV2 } from "@morpho-org/blue-sdk-viem";
import type { Address } from "viem";
import {
  getRequirements,
  vaultV2Deposit,
  vaultV2ForceRedeem,
  vaultV2ForceWithdraw,
  vaultV2Redeem,
  vaultV2Withdraw,
} from "../../actions";
import { MAX_SLIPPAGE_TOLERANCE } from "../../helpers/constant";
import {
  ChainIdMismatchError,
  type Deallocation,
  type ERC20ApprovalAction,
  ExcessiveSlippageToleranceError,
  type MorphoClientType,
  type Requirement,
  type RequirementSignature,
  type Transaction,
  type VaultV2DepositAction,
  type VaultV2ForceRedeemAction,
  type VaultV2ForceWithdrawAction,
  type VaultV2RedeemAction,
  type VaultV2WithdrawAction,
  ZeroSharesAmountError,
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
   * @param {bigint} [params.slippageTolerance=DEFAULT_SLIPPAGE_TOLERANCE] - Optional slippage tolerance value. Default is 0.03%. Slippage tolerance must be less than 10%.
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
   * @param {Address} params.userAddress - User address initiating the withdraw.
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
   * @param {Address} params.userAddress - User address initiating the redeem.
   * @returns {Object} The result object.
   * @returns {Readonly<Transaction<VaultV2RedeemAction>>} returns.tx The prepared redeem transaction.
   */
  redeem: (params: { shares: bigint; userAddress: Address }) => {
    buildTx: () => Readonly<Transaction<VaultV2RedeemAction>>;
  };
  /**
   * Prepares a force withdraw transaction for the VaultV2 contract using the vault's native multicall.
   *
   * This function encodes one or more on-chain forceDeallocate calls followed by a single withdraw,
   * executed atomically via VaultV2's multicall. This allows a user to free liquidity from multiple
   * illiquid markets and withdraw the resulting assets in one transaction.
   *
   * @param {Object} params - The force withdraw parameters.
   * @param {readonly Deallocation[]} params.deallocations - The typed list of deallocations to perform.
   * @param {Object} params.withdraw - The withdraw parameters applied after deallocations.
   * @param {bigint} params.withdraw.assets - The amount of assets to withdraw.
   * @param {Address} params.userAddress - User address (penalty source and withdraw recipient).
   * @returns {Object} The result object.
   * @returns {Readonly<Transaction<VaultV2ForceWithdrawAction>>} returns.buildTx The prepared multicall transaction.
   */
  forceWithdraw: (params: {
    deallocations: readonly Deallocation[];
    withdraw: { assets: bigint };
    userAddress: Address;
  }) => {
    buildTx: () => Readonly<Transaction<VaultV2ForceWithdrawAction>>;
  };
  /**
   * Prepares a force redeem transaction for the VaultV2 contract using the vault's native multicall.
   *
   * This function encodes one or more on-chain forceDeallocate calls followed by a single redeem,
   * executed atomically via VaultV2's multicall. This allows a user to free liquidity from multiple
   * illiquid markets and redeem all their shares in one transaction.
   *
   * This is the share-based counterpart to forceWithdraw, useful for maximum withdrawal scenarios
   * where specifying an exact asset amount is impractical.
   *
   * The total assets passed to forceDeallocate calls must be greater than or equal to the
   * asset-equivalent of the redeemed shares. The caller should apply a buffer on the deallocated
   * amounts to account for share-price drift between submission and execution.
   *
   * @param {Object} params - The force redeem parameters.
   * @param {readonly Deallocation[]} params.deallocations - The typed list of deallocations to perform.
   * @param {Object} params.redeem - The redeem parameters applied after deallocations.
   * @param {bigint} params.redeem.shares - The amount of shares to redeem.
   * @param {Address} params.userAddress - User address (penalty source and redeem recipient).
   * @returns {Object} The result object.
   * @returns {Readonly<Transaction<VaultV2ForceRedeemAction>>} returns.buildTx The prepared multicall transaction.
   */
  forceRedeem: (params: {
    deallocations: readonly Deallocation[];
    redeem: { shares: bigint };
    userAddress: Address;
  }) => {
    buildTx: () => Readonly<Transaction<VaultV2ForceRedeemAction>>;
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

    if (slippageTolerance > MAX_SLIPPAGE_TOLERANCE) {
      throw new ExcessiveSlippageToleranceError(slippageTolerance);
    }

    const shares = vaultData.toShares(assets);
    if (shares === 0n) {
      throw new ZeroSharesAmountError(this.vault);
    }

    const maxSharePrice = MathLib.min(
      MathLib.mulDivUp(
        assets,
        MathLib.wToRay(MathLib.WAD + slippageTolerance),
        shares,
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
    if (this.client.viemClient.chain?.id !== this.chainId) {
      throw new ChainIdMismatchError(
        this.client.viemClient.chain?.id,
        this.chainId,
      );
    }

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
    if (this.client.viemClient.chain?.id !== this.chainId) {
      throw new ChainIdMismatchError(
        this.client.viemClient.chain?.id,
        this.chainId,
      );
    }

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

  forceWithdraw({
    deallocations,
    withdraw,
    userAddress,
  }: {
    deallocations: readonly Deallocation[];
    withdraw: { assets: bigint };
    userAddress: Address;
  }) {
    if (this.client.viemClient.chain?.id !== this.chainId) {
      throw new ChainIdMismatchError(
        this.client.viemClient.chain?.id,
        this.chainId,
      );
    }

    return {
      buildTx: () =>
        vaultV2ForceWithdraw({
          vault: { address: this.vault },
          args: {
            deallocations,
            withdraw: {
              assets: withdraw.assets,
              recipient: userAddress,
            },
            onBehalf: userAddress,
          },
          metadata: this.client.options.metadata,
        }),
    };
  }

  forceRedeem({
    deallocations,
    redeem,
    userAddress,
  }: {
    deallocations: readonly Deallocation[];
    redeem: { shares: bigint };
    userAddress: Address;
  }) {
    if (this.client.viemClient.chain?.id !== this.chainId) {
      throw new ChainIdMismatchError(
        this.client.viemClient.chain?.id,
        this.chainId,
      );
    }

    return {
      buildTx: () =>
        vaultV2ForceRedeem({
          vault: { address: this.vault },
          args: {
            deallocations,
            redeem: {
              shares: redeem.shares,
              recipient: userAddress,
            },
            onBehalf: userAddress,
          },
          metadata: this.client.options.metadata,
        }),
    };
  }
}
