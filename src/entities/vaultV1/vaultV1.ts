import { DEFAULT_SLIPPAGE_TOLERANCE, MathLib } from "@morpho-org/blue-sdk";
import { fetchAccrualVault, fetchVault } from "@morpho-org/blue-sdk-viem";
import type { Address } from "viem";
import {
  getRequirements,
  vaultV1Deposit,
  vaultV1Redeem,
  vaultV1Withdraw,
} from "../../actions";
import { MAX_SLIPPAGE_TOLERANCE } from "../../helpers/constant";
import {
  ChainIdMismatchError,
  type ERC20ApprovalAction,
  ExcessiveSlippageToleranceError,
  type MorphoClientType,
  NegativeNativeAmountError,
  NegativeSlippageToleranceError,
  NonPositiveAssetAmountError,
  NonPositiveSharesAmountError,
  type Requirement,
  type RequirementSignature,
  type Transaction,
  type VaultV1DepositAction,
  type VaultV1RedeemAction,
  type VaultV1WithdrawAction,
} from "../../types";
import type { FetchParameters } from "../../types/data";

export interface VaultV1Actions {
  /**
   * Fetches the latest vault data with accrued interest.
   *
   * @param {FetchParameters} [parameters] - Optional fetch parameters (block number, state overrides, etc.).
   * @returns {Promise<Awaited<ReturnType<typeof fetchAccrualVault>>>} The latest accrued vault data.
   */
  getData: (
    parameters?: FetchParameters,
  ) => Promise<Awaited<ReturnType<typeof fetchAccrualVault>>>;
  /**
   * Prepares a deposit into a VaultV1 (MetaMorpho) contract.
   *
   * Fetches on-chain vault data to compute `maxSharePrice` with slippage tolerance,
   * then returns `buildTx` and `getRequirements` for lazy evaluation.
   *
   * @param {Object} params - The deposit parameters.
   * @param {bigint} params.amount - Amount of assets to deposit.
   * @param {Address} params.userAddress - User address initiating the deposit.
   * @param {bigint} [params.slippageTolerance=DEFAULT_SLIPPAGE_TOLERANCE] - Slippage tolerance (default 0.03%, max 10%).
   * @param {bigint} [params.nativeAmount] - Amount of native ETH to wrap into WETH. Vault asset must be wNative.
   * @returns {Promise<Object>} Object with `buildTx` and `getRequirements`.
   */
  deposit: (params: {
    amount: bigint;
    userAddress: Address;
    slippageTolerance?: bigint;
    nativeAmount?: bigint;
  }) => Promise<{
    buildTx: (
      requirementSignature?: RequirementSignature,
    ) => Readonly<Transaction<VaultV1DepositAction>>;
    getRequirements: (params?: {
      useSimplePermit?: boolean;
    }) => Promise<(Readonly<Transaction<ERC20ApprovalAction>> | Requirement)[]>;
  }>;
  /**
   * Prepares a withdraw from a VaultV1 (MetaMorpho) contract.
   *
   * @param {Object} params - The withdraw parameters.
   * @param {bigint} params.amount - Amount of assets to withdraw.
   * @param {Address} params.userAddress - User address initiating the withdraw.
   * @returns {Object} Object with `buildTx`.
   */
  withdraw: (params: { amount: bigint; userAddress: Address }) => {
    buildTx: () => Readonly<Transaction<VaultV1WithdrawAction>>;
  };
  /**
   * Prepares a redeem from a VaultV1 (MetaMorpho) contract.
   *
   * @param {Object} params - The redeem parameters.
   * @param {bigint} params.shares - Amount of shares to redeem.
   * @param {Address} params.userAddress - User address initiating the redeem.
   * @returns {Object} Object with `buildTx`.
   */
  redeem: (params: { shares: bigint; userAddress: Address }) => {
    buildTx: () => Readonly<Transaction<VaultV1RedeemAction>>;
  };
}

export class MorphoVaultV1 implements VaultV1Actions {
  constructor(
    private readonly client: MorphoClientType,
    private readonly vault: Address,
    private readonly chainId: number,
  ) {}

  async getData(parameters?: FetchParameters) {
    if (
      this.client.viemClient.chain?.id &&
      this.client.viemClient.chain?.id !== this.chainId
    ) {
      throw new ChainIdMismatchError(
        this.client.viemClient.chain?.id,
        this.chainId,
      );
    }

    return fetchAccrualVault(this.vault, this.client.viemClient, {
      ...parameters,
      chainId: this.chainId,
      deployless: this.client.options.supportDeployless,
    });
  }

  async deposit({
    amount,
    userAddress,
    slippageTolerance = DEFAULT_SLIPPAGE_TOLERANCE,
    nativeAmount,
  }: {
    amount: bigint;
    userAddress: Address;
    slippageTolerance?: bigint;
    nativeAmount?: bigint;
  }) {
    if (this.client.viemClient.chain?.id !== this.chainId) {
      throw new ChainIdMismatchError(
        this.client.viemClient.chain?.id,
        this.chainId,
      );
    }

    if (amount < 0n) {
      throw new NonPositiveAssetAmountError(this.vault);
    }

    if (nativeAmount && nativeAmount < 0n) {
      throw new NegativeNativeAmountError(nativeAmount);
    }

    if (slippageTolerance < 0n) {
      throw new NegativeSlippageToleranceError(slippageTolerance);
    }
    if (slippageTolerance > MAX_SLIPPAGE_TOLERANCE) {
      throw new ExcessiveSlippageToleranceError(slippageTolerance);
    }

    const vaultData = await fetchVault(this.vault, this.client.viemClient, {
      chainId: this.chainId,
      deployless: this.client.options.supportDeployless,
    });

    const shares = vaultData.toShares(amount);
    if (shares <= 0n) {
      throw new NonPositiveSharesAmountError(this.vault);
    }

    const totalAssets = amount + (nativeAmount ?? 0n);

    const maxSharePrice = MathLib.min(
      MathLib.mulDivUp(
        totalAssets,
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
            amount,
            from: userAddress,
          },
        }),

      buildTx: (requirementSignature?: RequirementSignature) =>
        vaultV1Deposit({
          vault: {
            chainId: this.chainId,
            address: this.vault,
            asset: vaultData.asset,
          },
          args: {
            amount,
            maxSharePrice,
            recipient: userAddress,
            requirementSignature,
            nativeAmount,
          },
          metadata: this.client.options.metadata,
        }),
    };
  }

  withdraw({ amount, userAddress }: { amount: bigint; userAddress: Address }) {
    if (this.client.viemClient.chain?.id !== this.chainId) {
      throw new ChainIdMismatchError(
        this.client.viemClient.chain?.id,
        this.chainId,
      );
    }

    return {
      buildTx: () =>
        vaultV1Withdraw({
          vault: { address: this.vault },
          args: {
            amount,
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
        vaultV1Redeem({
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
