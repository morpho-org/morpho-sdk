import {
  getChainAddresses,
  MathLib,
  NATIVE_ADDRESS,
  permissionedBackedTokens,
  permissionedWrapperTokens,
} from "@morpho-org/blue-sdk";
import { fetchHolding } from "@morpho-org/blue-sdk-viem";
import {
  APPROVE_ONLY_ONCE_TOKENS,
  Operations,
} from "@morpho-org/simulation-sdk";
import { Time } from "@morpho-org/morpho-ts";
import { MorphoClient } from "src";

export const getRequirement = async (
  client: MorphoClient,
  { address, args: { amount, from } }: Operations["Erc20_Transfer"],
  { hasSimplePermit = false }: { hasSimplePermit?: boolean } = {}
) => {
  const chainId = client.walletClient.chain?.id;
  if (!chainId) {
    throw new Error("Chain ID not found in wallet client");
  }

  const {
    bundler3: { generalAdapter1 },
    permit2,
  } = getChainAddresses(chainId);

  // If native token, it is expected to be sent along as call value.
  if (address === NATIVE_ADDRESS)
    return [
      {
        type: "Erc20_Transfer",
        sender: from,
        address,
        args: {
          amount,
          from,
          to: generalAdapter1,
        },
      },
    ];

  const { erc20Allowances, permit2BundlerAllowance, erc2612Nonce } =
    await fetchHolding(from, address, client.walletClient);

  // ERC20 allowance to the bundler is enough, consume it.
  if (erc20Allowances["bundler3.generalAdapter1"] >= amount)
    return [
      {
        type: "Erc20_Transfer",
        sender: generalAdapter1,
        address,
        args: {
          amount,
          from,
          to: generalAdapter1,
        },
      },
    ];

  //   const operations: Exclude<BundlerOperation, CallbackBundlerOperation>[] = [];
  const operations = [];

  // Try using simple permit.
  const useSimplePermit = erc2612Nonce != null && hasSimplePermit;
  const useSimpleTransfer =
    permit2 == null ||
    // Token is permissioned and Permit2 may not be authorized so Permit2 cannot be used.
    !!permissionedWrapperTokens[chainId]?.has(address) ||
    !!permissionedBackedTokens[chainId]?.has(address);

  if (useSimplePermit)
    operations.push({
      type: "Erc20_Permit",
      sender: from,
      address,
      args: {
        amount,
        spender: generalAdapter1,
        nonce: erc2612Nonce,
      },
    });
  else if (useSimpleTransfer) {
    if (
      APPROVE_ONLY_ONCE_TOKENS[chainId]?.includes(address) &&
      erc20Allowances["bundler3.generalAdapter1"] > 0n
    )
      operations.push({
        type: "Erc20_Approve",
        sender: from,
        address,
        args: {
          amount: 0n,
          spender: generalAdapter1,
        },
      });
    operations.push({
      type: "Erc20_Approve",
      sender: from,
      address,
      args: {
        amount,
        spender: generalAdapter1,
      },
    });
  }

  if (useSimplePermit || useSimpleTransfer)
    operations.push({
      type: "Erc20_Transfer",
      sender: generalAdapter1,
      address,
      args: {
        amount,
        from,
        to: generalAdapter1,
      },
    });
  // Simple permit is not supported: fallback to Permit2.
  else {
    if (erc20Allowances.permit2 < amount) {
      if (
        APPROVE_ONLY_ONCE_TOKENS[chainId]?.includes(address) &&
        erc20Allowances.permit2 > 0n
      )
        operations.push({
          type: "Erc20_Approve",
          sender: from,
          address,
          args: {
            amount: 0n,
            spender: permit2,
          },
        });
      operations.push({
        type: "Erc20_Approve",
        sender: from,
        address,
        args: {
          amount: MathLib.MAX_UINT_160, // Always approve infinite.
          spender: permit2,
        },
      });
    }

    if (
      permit2BundlerAllowance.amount < amount ||
      permit2BundlerAllowance.expiration < Time.timestamp()
    )
      operations.push({
        type: "Erc20_Permit2",
        sender: from,
        address,
        args: {
          amount,
          expiration: MathLib.MAX_UINT_48, // Always approve indefinitely.
          nonce: permit2BundlerAllowance.nonce,
        },
      });

    operations.push({
      type: "Erc20_Transfer2",
      sender: generalAdapter1,
      address,
      args: {
        amount,
        from,
        to: generalAdapter1,
      },
    });
  }

  return operations;
};
