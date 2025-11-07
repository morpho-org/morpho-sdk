import { type Address, getChainAddresses } from "@morpho-org/blue-sdk";
import { fetchHolding } from "@morpho-org/blue-sdk-viem";
import { APPROVE_ONLY_ONCE_TOKENS } from "@morpho-org/simulation-sdk";
import { withTelemetry } from "../../telemetry/wrapper";
import type {
  ERC20ApprovalAction,
  MorphoClient,
  Transaction,
} from "../../types";

import { encodeErc20Approval } from "./encodeErc20Approval";

const _getRequirements = async (
  client: MorphoClient,
  {
    address,
    args: { amount, from },
  } : { address: Address; args: { amount: bigint; from: Address } },
): Promise<Readonly<Transaction<ERC20ApprovalAction>[]>> => {
  // Same here, freezing is useless as you destruct the object
  // Rather destruct the params directly in the function signature here

  const chainId = client.walletClient.chain?.id;
  if (!chainId) {
    // Use a custom error class here 
    // - Standardize the error messages
    // - Ease the error handling
    throw new Error("Chain ID not found in wallet client");
  }

  const {
    bundler3: { generalAdapter1 },
  } = getChainAddresses(chainId);

  const { erc20Allowances } = await fetchHolding(
    from,
    address,
    client.walletClient,
  );

  const txs: Transaction<ERC20ApprovalAction>[] = [];

  // Handle permit and permit2
  if (erc20Allowances["bundler3.generalAdapter1"] < amount) {
    if (
      APPROVE_ONLY_ONCE_TOKENS[chainId]?.includes(address) &&
      erc20Allowances["bundler3.generalAdapter1"] > 0n
    ) {
      txs.push(
        encodeErc20Approval({
          token: address,
          spender: generalAdapter1,
          amount: 0n,
          chainId,
        }),
      );
    }

    txs.push(
      encodeErc20Approval({
        token: address,
        spender: generalAdapter1,
        amount,
        chainId,
      }),
    );
  }

  // I'm not sure we want to freeze the object here
  // It prevents the consumer from pushing other txs in the requirements array
  // In case we do, we should use `deepFreeze` from `@morpho-org/utils`
  return Object.freeze(txs);
};

export const getRequirements = withTelemetry(
  "getRequirements",
  _getRequirements,
);
