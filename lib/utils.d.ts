import { type Abi, type AbiItemArgs, type AbiItemName, type Chain, type Client, type ContractFunctionArgs, type ContractFunctionName, type ExtractAbiFunctionForArgs, type GetAbiItemParameters, type ReadContractParameters, type Transport } from "viem";
export declare const safeGetAddress: (address: string) => `0x${string}`;
export declare const safeParseNumber: (value: number, decimals?: number) => bigint;
export declare const safeParseUnits: (strValue: string, decimals?: number) => bigint;
type ZipToObject<T extends readonly {
    name?: string;
}[], V extends readonly unknown[]> = T extends readonly [infer Head, ...infer RestT] ? V extends readonly [infer HeadValue, ...infer RestV] ? Head extends {
    name?: infer N;
} ? N extends string ? {
    [K in N]: HeadValue;
} & ZipToObject<RestT extends readonly {
    name?: string;
}[] ? RestT : [], RestV extends readonly unknown[] ? RestV : []> : ZipToObject<RestT extends readonly {
    name?: string;
}[] ? RestT : [], RestV extends readonly unknown[] ? RestV : []> : ZipToObject<RestT extends readonly {
    name?: string;
}[] ? RestT : [], RestV extends readonly unknown[] ? RestV : []> : object : object;
/**
 * When reading contracts, viem converts onchain tuples into arrays -- even when tuple values are named in the ABI.
 * [They argue](https://viem.sh/docs/faq#why-is-a-contract-function-return-type-returning-an-array-instead-of-an-object)
 * this information loss is justified, as it eliminates the ambiguity between tuple return types and struct return
 * types. This utility can be used to convert viem's arrays back to objects, _as if_ the onchain method returned a
 * struct.
 *
 * @example
 *
 * ```
 * // Use with viem...
 * const params = restructure(
 *   await readContract(client, {
 *     ...parameters,
 *     address: morpho,
 *     abi: blueAbi,
 *     functionName: "idToMarketParams",
 *     args: [id],
 *   }),
 *   // These `args` should be placeholders; just match the type of the actual `args` above
 *   { abi: blueAbi, name: "idToMarketParams", args: ["0x"] },
 * )
 * ```
 *
 * @example
 *
 * ```
 * // Use with wagmi hook...
 * const { data: marketsData } = useReadContracts({
 *   contracts: marketIds.map(
 *     (marketId) =>
 *       ({
 *         chainId,
 *         address: morphoAddress,
 *         abi: morphoAbi,
 *         functionName: "market",
 *         args: [marketId],
 *       }) as const,
 *   ),
 *   allowFailure: false,
 *   query: {
 *     select(data) {
 *       // These `args` should be placeholders; just match the type of the actual `args` above
 *       return data.map((x) => restructure(x, { abi: morphoAbi, name: "market", args: ["0x"] }));
 *     },
 *   },
 * });
 * ```
 */
export declare function restructure<const abi extends Abi, name extends AbiItemName<abi> & ContractFunctionName<abi, "view" | "pure">, const args extends AbiItemArgs<abi, name>, outputs extends readonly unknown[]>(outputs: outputs, parameters: GetAbiItemParameters<abi, name, args>): ZipToObject<ExtractAbiFunctionForArgs<abi, "pure" | "view", name, args>["outputs"], outputs>;
/**
 * When reading contracts, viem converts onchain tuples into arrays -- even when tuple values are named in the ABI.
 * [They argue](https://viem.sh/docs/faq#why-is-a-contract-function-return-type-returning-an-array-instead-of-an-object)
 * this information loss is justified, as it eliminates the ambiguity between tuple return types and struct return
 * types. This wrapper converts viem's arrays back to objects, _as if_ the onchain method returned a struct.
 *
 * @see {@link restructure}
 */
export declare function readContractRestructured<chain extends Chain | undefined, const abi extends Abi, name extends AbiItemName<abi> & ContractFunctionName<abi, "view" | "pure">, const args extends ContractFunctionArgs<abi, "view" | "pure", name>>(client: Client<Transport, chain>, parameters: ReadContractParameters<abi, name, args>): Promise<ZipToObject<ExtractAbiFunctionForArgs<abi, "pure" | "view", name, args>["outputs"], Awaited<import("viem").ContractFunctionReturnType<abi, "pure" | "view", name, args>> extends infer T ? T extends Awaited<import("viem").ContractFunctionReturnType<abi, "pure" | "view", name, args>> ? T extends readonly unknown[] ? T : never : never : never>>;
export {};
