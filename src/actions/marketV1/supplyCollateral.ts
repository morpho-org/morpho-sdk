import { getChainAddresses } from "@morpho-org/blue-sdk";
import { blueAbi } from "@morpho-org/blue-sdk-viem";
import { type Action, BundlerAction } from "@morpho-org/bundler-sdk-viem";
import { deepFreeze, isDefined } from "@morpho-org/morpho-ts";
import {
  type Address,
  encodeFunctionData,
  type Hex,
  isAddressEqual,
} from "viem";
import { addTransactionMetadata } from "../../helpers";
import {
  ChainWNativeMissingError,
  type DepositAmountArgs,
  type MarketParamsInput,
  type MarketV1SupplyCollateralAction,
  type Metadata,
  NativeAmountOnNonWNativeCollateralError,
  NegativeNativeAmountError,
  NonPositiveAssetAmountError,
  type RequirementSignature,
  type Transaction,
  ZeroCollateralAmountError,
} from "../../types";
import { getRequirementsAction } from "../requirements/getRequirementsAction";

export interface MarketV1SupplyCollateralParams {
  market: {
    readonly chainId: number;
    readonly morpho: Address;
    readonly marketId: Hex;
    readonly marketParams: MarketParamsInput;
  };
  args: DepositAmountArgs & {
    onBehalf: Address;
    requirementSignature?: RequirementSignature;
  };
  metadata?: Metadata;
}

/**
 * Prepares a supply-collateral transaction for a Morpho Blue market.
 *
 * - **Direct path** (no `nativeAmount`): calls `morpho.supplyCollateral()` directly. No bundler overhead.
 * - **Bundler path** (`nativeAmount` provided): wraps native token via GeneralAdapter1.
 *   Collateral token must be the chain's wNative.
 *
 * Zero loss: all collateral reaches Morpho. No dust left in bundler or adapter.
 *
 * @param params - Supply collateral parameters.
 * @returns Deep-frozen transaction.
 */
export const marketV1SupplyCollateral = ({
  market: { chainId, morpho, marketId, marketParams },
  args: { amount = 0n, onBehalf, requirementSignature, nativeAmount },
  metadata,
}: MarketV1SupplyCollateralParams): Readonly<
  Transaction<MarketV1SupplyCollateralAction>
> => {
  if (amount < 0n) {
    throw new NonPositiveAssetAmountError(marketParams.collateralToken);
  }

  if (nativeAmount !== undefined && nativeAmount < 0n) {
    throw new NegativeNativeAmountError(nativeAmount);
  }

  const totalCollateral = amount + (nativeAmount ?? 0n);

  if (totalCollateral === 0n) {
    throw new ZeroCollateralAmountError(marketId);
  }

  let tx: { to: Address; data: Hex; value: bigint };

  if (nativeAmount) {
    // --- Bundler path: native wrapping required ---
    const {
      bundler3: { generalAdapter1, bundler3 },
      wNative,
    } = getChainAddresses(chainId);

    if (!isDefined(wNative)) {
      throw new ChainWNativeMissingError(chainId);
    }
    if (!isAddressEqual(marketParams.collateralToken, wNative)) {
      throw new NativeAmountOnNonWNativeCollateralError(
        marketParams.collateralToken,
        wNative,
      );
    }

    const actions: Action[] = [];

    actions.push(
      {
        type: "nativeTransfer",
        args: [bundler3, generalAdapter1, nativeAmount, false],
      },
      {
        type: "wrapNative",
        args: [nativeAmount, generalAdapter1, false],
      },
    );

    if (amount > 0n) {
      if (requirementSignature) {
        actions.push(
          ...getRequirementsAction({
            chainId,
            asset: marketParams.collateralToken,
            amount,
            requirementSignature,
          }),
        );
      } else {
        actions.push({
          type: "erc20TransferFrom",
          args: [marketParams.collateralToken, amount, generalAdapter1, false],
        });
      }
    }

    actions.push({
      type: "morphoSupplyCollateral",
      args: [marketParams, totalCollateral, onBehalf, [], false],
    });

    tx = {
      ...BundlerAction.encodeBundle(chainId, actions),
      value: nativeAmount,
    };
  } else {
    // --- Direct path: straight morpho.supplyCollateral ---
    tx = {
      to: morpho,
      data: encodeFunctionData({
        abi: blueAbi,
        functionName: "supplyCollateral",
        args: [marketParams, totalCollateral, onBehalf, "0x"],
      }),
      value: 0n,
    };
  }

  if (metadata) {
    tx = addTransactionMetadata(tx, metadata);
  }

  return deepFreeze({
    ...tx,
    action: {
      type: "marketV1SupplyCollateral",
      args: {
        market: marketId,
        amount: totalCollateral,
        onBehalf,
        nativeAmount,
      },
    },
  });
};
