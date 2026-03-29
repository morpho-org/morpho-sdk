import { getChainAddresses } from "@morpho-org/blue-sdk";
import { type Action, BundlerAction } from "@morpho-org/bundler-sdk-viem";
import { deepFreeze, isDefined } from "@morpho-org/morpho-ts";
import { type Address, type Hex, isAddressEqual } from "viem";
import { addTransactionMetadata } from "../../helpers";
import {
  ChainWNativeMissingError,
  type DepositAmountArgs,
  type MarketParamsInput,
  type MarketV1SupplyCollateralBorrowAction,
  type Metadata,
  NativeAmountOnNonWNativeCollateralError,
  NegativeNativeAmountError,
  NonPositiveAssetAmountError,
  NonPositiveBorrowAmountError,
  type RequirementSignature,
  type Transaction,
  ZeroCollateralAmountError,
} from "../../types";
import { getRequirementsAction } from "../requirements/getRequirementsAction";

export interface MarketV1SupplyCollateralBorrowParams {
  market: {
    readonly chainId: number;
    readonly marketId: Hex;
    readonly marketParams: MarketParamsInput;
  };
  args: DepositAmountArgs & {
    borrowAmount: bigint;
    onBehalf: Address;
    receiver: Address;
    requirementSignature?: RequirementSignature;
  };
  metadata?: Metadata;
}

/**
 * Prepares an atomic supply-collateral-and-borrow transaction for a Morpho Blue market.
 *
 * Routed through the bundler: collateral transfer + `morphoSupplyCollateral` + `morphoBorrow`.
 * When `nativeAmount` is provided, native ETH is wrapped via GeneralAdapter1.
 *
 * **Prerequisite:** GeneralAdapter1 must be authorized on Morpho to borrow on behalf of the user.
 * Use `getRequirements()` on the entity to check and obtain the authorization transaction.
 *
 * Zero loss: all collateral reaches Morpho, all borrowed tokens reach the receiver.
 * No dust left in bundler or adapter.
 *
 * @param params - Combined supply collateral and borrow parameters.
 * @returns Deep-frozen transaction.
 */
export const marketV1SupplyCollateralBorrow = ({
  market: { chainId, marketId, marketParams },
  args: {
    amount = 0n,
    borrowAmount,
    onBehalf,
    receiver,
    requirementSignature,
    nativeAmount,
  },
  metadata,
}: MarketV1SupplyCollateralBorrowParams): Readonly<
  Transaction<MarketV1SupplyCollateralBorrowAction>
> => {
  if (amount < 0n) {
    throw new NonPositiveAssetAmountError(marketParams.collateralToken);
  }

  if (nativeAmount !== undefined && nativeAmount < 0n) {
    throw new NegativeNativeAmountError(nativeAmount);
  }

  if (borrowAmount <= 0n) {
    throw new NonPositiveBorrowAmountError(marketId);
  }

  const totalCollateral = amount + (nativeAmount ?? 0n);

  if (totalCollateral === 0n) {
    throw new ZeroCollateralAmountError(marketId);
  }

  const {
    bundler3: { generalAdapter1, bundler3 },
    wNative,
  } = getChainAddresses(chainId);

  const actions: Action[] = [];

  if (nativeAmount) {
    if (!isDefined(wNative)) {
      throw new ChainWNativeMissingError(chainId);
    }
    if (!isAddressEqual(marketParams.collateralToken, wNative)) {
      throw new NativeAmountOnNonWNativeCollateralError(
        marketParams.collateralToken,
        wNative,
      );
    }

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
  }

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

  actions.push(
    {
      type: "morphoSupplyCollateral",
      args: [marketParams, totalCollateral, onBehalf, [], false],
    },
    {
      type: "morphoBorrow",
      args: [marketParams, borrowAmount, 0n, 0n, receiver, false],
    },
  );

  let tx = BundlerAction.encodeBundle(chainId, actions);

  if (nativeAmount) {
    tx = { ...tx, value: nativeAmount };
  }

  if (metadata) {
    tx = addTransactionMetadata(tx, metadata);
  }

  return deepFreeze({
    ...tx,
    action: {
      type: "marketV1SupplyCollateralBorrow",
      args: {
        market: marketId,
        collateralAmount: totalCollateral,
        borrowAmount,
        onBehalf,
        receiver,
        nativeAmount,
      },
    },
  });
};
