// import {
//   getChainAddresses,
//   MathLib,
//   NATIVE_ADDRESS,
//   permissionedBackedTokens,
//   permissionedWrapperTokens,
// } from "@morpho-org/blue-sdk";
// import {
//   fetchHolding,
//   getDaiPermitTypedData,
//   getPermitTypedData,
// } from "@morpho-org/blue-sdk-viem";
// import {
//   APPROVE_ONLY_ONCE_TOKENS,
//   Operations,
// } from "@morpho-org/simulation-sdk";
// import { Time } from "@morpho-org/morpho-ts";
// import { MorphoClient } from "src";
// import {
//   Action,
//   ActionBundle,
//   ActionBundleRequirements,
//   BundlerErrors,
//   encodeOperation,
// } from "@morpho-org/bundler-sdk-viem";
// import { Account, Address, Client, verifyTypedData } from "viem";
// import { signTypedData } from "viem/actions";
// import { encodeErc20Approval } from "./encodeErc20Approval";

// export const getPermit = async (
//   chainId: number,
//   {
//     address,
//     sender,
//     args,
//   }: {
//     address: Address;
//     sender: Address;
//     args: {
//       amount: bigint;
//       spender: Address;
//       nonce: bigint;
//       deadline?: bigint;
//     };
//   },
//   { supportsSignature = false }: { supportsSignature?: boolean } = {}
// ) => {
//   // Native token cannot be permitted.
//   if (address === NATIVE_ADDRESS) return;

//   const {
//     amount,
//     spender,
//     nonce,
//     deadline = Time.timestamp() + Time.s.from.h(2n),
//   } = args;

//   const {
//     bundler3: { generalAdapter1 },
//     dai,
//   } = getChainAddresses(chainId);

//   // Never permit any other address than the GeneralAdapter1 otherwise
//   // the signature can be used independently.
//   if (spender !== generalAdapter1)
//     throw new BundlerErrors.UnexpectedSignature(spender);

//   const actions: Action[] = [];
//   const requirements: ActionBundleRequirements = new ActionBundleRequirements();

//   if (supportsSignature) {
//     const isDai = dai != null && address === dai;

//     const action: Action = isDai
//       ? {
//           type: "permitDai",
//           args: [sender, nonce, deadline, amount > 0n, null, false],
//         }
//       : {
//           type: "permit",
//           args: [sender, address, amount, deadline, null, false],
//         };

//     actions.push(action);

//     const tokenData = dataBefore.getToken(operation.address);

//     requirements.signatures.push({
//       action,
//       async sign(client: Client, account: Account = client.account!) {
//         let signature = action.args[4];
//         if (signature != null) return signature; // action is already signed

//         if (isDai) {
//           const typedData = getDaiPermitTypedData(
//             {
//               owner: sender,
//               spender,
//               allowance: amount,
//               nonce,
//               deadline,
//             },
//             chainId
//           );
//           signature = await signTypedData(client, {
//             ...typedData,
//             account,
//           });

//           await verifyTypedData({
//             ...typedData,
//             address: account.address,
//             signature,
//           });
//         } else {
//           const typedData = getPermitTypedData(
//             {
//               erc20: tokenData,
//               owner: sender,
//               spender,
//               allowance: amount,
//               nonce,
//               deadline,
//             },
//             chainId
//           );
//           signature = await signTypedData(client, {
//             ...typedData,
//             account,
//           });

//           await verifyTypedData({
//             ...typedData,
//             address: sender, // Verify against the permit's owner.
//             signature,
//           });
//         }

//         return (action.args[4] = signature);
//       },
//     });

//     return { actions, requirements };
//   }

//   // Simple permit is not supported, fallback to standard approval.

//   // Ignore zero permits used to reset allowances at the end of a bundle
//   // when the signer does not support signatures, as they cannot be bundled.
//   // Currently only used by DAI-specific permit which does not support specific amounts.
//   if (amount > 0n)
//     requirements.txs.push(
//       ...encodeErc20Approval(address, spender, amount, chainId)
//     );

//   return { actions, requirements };
// };
