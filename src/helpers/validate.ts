import { getChainAddresses } from "@morpho-org/blue-sdk";
import { isDefined } from "@morpho-org/morpho-ts";
import { type Address, isAddressEqual } from "viem";
import {
  ChainIdMismatchError,
  ChainWNativeMissingError,
  NativeAmountOnNonWNativeCollateralError,
} from "../types";

/**
 * Validates that the viem client chain ID matches the expected chain ID.
 * Throws {@link ChainIdMismatchError} if they differ.
 *
 * @param clientChainId - Chain ID reported by the viem client (may be undefined).
 * @param expectedChainId - Chain ID expected by the entity or action.
 */
export const validateChainId = (
  clientChainId: number | undefined,
  expectedChainId: number,
): void => {
  if (isDefined(clientChainId) && clientChainId !== expectedChainId) {
    throw new ChainIdMismatchError(clientChainId, expectedChainId);
  }
};

/**
 * Validates that the given collateral token is the chain's wrapped native token.
 * Throws {@link ChainWNativeMissingError} if wNative is not configured for the chain.
 * Throws {@link NativeAmountOnNonWNativeCollateralError} if collateral is not wNative.
 *
 * @param chainId - The chain to look up wNative on.
 * @param collateralToken - The market's collateral token address.
 */
export const validateNativeCollateral = (
  chainId: number,
  collateralToken: Address,
): void => {
  const { wNative } = getChainAddresses(chainId);
  if (!isDefined(wNative)) {
    throw new ChainWNativeMissingError(chainId);
  }
  if (!isAddressEqual(collateralToken, wNative)) {
    throw new NativeAmountOnNonWNativeCollateralError(collateralToken, wNative);
  }
};
