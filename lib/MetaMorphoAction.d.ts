import type { InputMarketParams, MarketId } from "@morpho-org/blue-sdk";
import { type Address, type Hex } from "viem";
export type MetaMorphoCall = Hex;
export interface InputAllocation {
    marketParams: InputMarketParams;
    assets: bigint;
}
export declare namespace MetaMorphoAction {
    /**
     * Encodes a call to a MetaMorpho vault to set the curator.
     * @param newCurator The address of the new curator.
     */
    function setCurator(newCurator: Address): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to enable or disable an allocator.
     * @param newAllocator The address of the allocator.
     * @param newIsAllocator Whether the allocator should be enabled or disabled.
     */
    function setIsAllocator(newAllocator: Address, newIsAllocator: boolean): MetaMorphoCall;
    /**
     * Encode a call to a MetaMorpho vault to set the fee recipient.
     * @param newFeeRecipient The address of the new fee recipient.
     */
    function setFeeRecipient(newFeeRecipient: Address): MetaMorphoCall;
    /**
     * Encode a call to a MetaMorpho vault to set the skim recipient.
     * @param newSkimRecipient The address of the new skim recipient.
     */
    function setSkimRecipient(newSkimRecipient: Address): MetaMorphoCall;
    /**
     * Encode a call to a MetaMorpho vault to set the fee.
     * @param fee The new fee percentage (in WAD).
     */
    function setFee(fee: bigint): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to submit a new timelock.
     * @param newTimelock The new timelock (in seconds).
     */
    function submitTimelock(newTimelock: bigint): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to accept the pending timelock.
     */
    function acceptTimelock(): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to revoke the pending timelock.
     */
    function revokePendingTimelock(): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to submit a new supply cap.
     * @param marketParams The market params of the market of which to submit a supply cap.
     * @param newSupplyCap The new supply cap.
     */
    function submitCap(marketParams: InputMarketParams, newSupplyCap: bigint): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to accept the pending supply cap.
     * @param marketParams The market params of the market of which to accept the pending supply cap.
     */
    function acceptCap(marketParams: InputMarketParams): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to revoke the pending supply cap.
     * @param id The id of the market of which to revoke the pending supply cap.
     */
    function revokePendingCap(id: MarketId): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to submit a market removal.
     * @param marketParams The market params of the market to remove.
     */
    function submitMarketRemoval(marketParams: InputMarketParams): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to accept the pending market removal.
     * @param id The id of the market of which to accept the removal.
     */
    function revokePendingMarketRemoval(id: MarketId): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to submit a new guardian.
     * @param newGuardian The address of the new guardian.
     */
    function submitGuardian(newGuardian: Address): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to accept the pending guardian.
     */
    function acceptGuardian(): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to revoke the pending guardian.
     */
    function revokePendingGuardian(): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to skim ERC20 tokens.
     * @param erc20 The address of the ERC20 token to skim.
     */
    function skim(erc20: Address): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to set the supply queue.
     * @param supplyQueue The new supply queue.
     */
    function setSupplyQueue(supplyQueue: MarketId[]): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to update the withdraw queue.
     * @param indexes The indexes of each market in the previous withdraw queue, in the new withdraw queue's order.
     */
    function updateWithdrawQueue(indexes: bigint[]): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to reallocate the vault's liquidity across enabled markets.
     * @param allocations The new target allocations of each market.
     */
    function reallocate(allocations: InputAllocation[]): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to mint shares.
     * @param shares The amount of shares to mint.
     * @param receiver The address of the receiver of the shares.
     */
    function mint(shares: bigint, receiver: Address): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to deposit assets.
     * @param assets The amount of assets to deposit.
     * @param receiver The address of the receiver of the shares.
     */
    function deposit(assets: bigint, receiver: Address): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to withdraw assets.
     * @param assets The amount of assets to withdraw.
     * @param receiver The address of the receiver of the assets.
     * @param owner The address of the owner of the shares to redeem.
     */
    function withdraw(assets: bigint, receiver: Address, owner: Address): MetaMorphoCall;
    /**
     * Encodes a call to a MetaMorpho vault to redeem shares.
     * @param shares The amount of shares to redeem.
     * @param receiver The address of the receiver of the assets.
     * @param owner The address of the owner of the shares to redeem.
     */
    function redeem(shares: bigint, receiver: Address, owner: Address): MetaMorphoCall;
}
export default MetaMorphoAction;
