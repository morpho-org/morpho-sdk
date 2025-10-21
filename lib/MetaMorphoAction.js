"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaMorphoAction = void 0;
const viem_1 = require("viem");
const abis_1 = require("./abis");
var MetaMorphoAction;
(function (MetaMorphoAction) {
    /* CONFIGURATION */
    /**
     * Encodes a call to a MetaMorpho vault to set the curator.
     * @param newCurator The address of the new curator.
     */
    function setCurator(newCurator) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "setCurator",
            args: [newCurator],
        });
    }
    MetaMorphoAction.setCurator = setCurator;
    /**
     * Encodes a call to a MetaMorpho vault to enable or disable an allocator.
     * @param newAllocator The address of the allocator.
     * @param newIsAllocator Whether the allocator should be enabled or disabled.
     */
    function setIsAllocator(newAllocator, newIsAllocator) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "setIsAllocator",
            args: [newAllocator, newIsAllocator],
        });
    }
    MetaMorphoAction.setIsAllocator = setIsAllocator;
    /**
     * Encode a call to a MetaMorpho vault to set the fee recipient.
     * @param newFeeRecipient The address of the new fee recipient.
     */
    function setFeeRecipient(newFeeRecipient) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "setFeeRecipient",
            args: [newFeeRecipient],
        });
    }
    MetaMorphoAction.setFeeRecipient = setFeeRecipient;
    /**
     * Encode a call to a MetaMorpho vault to set the skim recipient.
     * @param newSkimRecipient The address of the new skim recipient.
     */
    function setSkimRecipient(newSkimRecipient) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "setSkimRecipient",
            args: [newSkimRecipient],
        });
    }
    MetaMorphoAction.setSkimRecipient = setSkimRecipient;
    /**
     * Encode a call to a MetaMorpho vault to set the fee.
     * @param fee The new fee percentage (in WAD).
     */
    function setFee(fee) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "setFee",
            args: [fee],
        });
    }
    MetaMorphoAction.setFee = setFee;
    /* TIMELOCK */
    /**
     * Encodes a call to a MetaMorpho vault to submit a new timelock.
     * @param newTimelock The new timelock (in seconds).
     */
    function submitTimelock(newTimelock) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "submitTimelock",
            args: [newTimelock],
        });
    }
    MetaMorphoAction.submitTimelock = submitTimelock;
    /**
     * Encodes a call to a MetaMorpho vault to accept the pending timelock.
     */
    function acceptTimelock() {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "acceptTimelock",
        });
    }
    MetaMorphoAction.acceptTimelock = acceptTimelock;
    /**
     * Encodes a call to a MetaMorpho vault to revoke the pending timelock.
     */
    function revokePendingTimelock() {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "revokePendingTimelock",
        });
    }
    MetaMorphoAction.revokePendingTimelock = revokePendingTimelock;
    /* SUPPLY CAP */
    /**
     * Encodes a call to a MetaMorpho vault to submit a new supply cap.
     * @param marketParams The market params of the market of which to submit a supply cap.
     * @param newSupplyCap The new supply cap.
     */
    function submitCap(marketParams, newSupplyCap) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "submitCap",
            args: [marketParams, newSupplyCap],
        });
    }
    MetaMorphoAction.submitCap = submitCap;
    /**
     * Encodes a call to a MetaMorpho vault to accept the pending supply cap.
     * @param marketParams The market params of the market of which to accept the pending supply cap.
     */
    function acceptCap(marketParams) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "acceptCap",
            args: [marketParams],
        });
    }
    MetaMorphoAction.acceptCap = acceptCap;
    /**
     * Encodes a call to a MetaMorpho vault to revoke the pending supply cap.
     * @param id The id of the market of which to revoke the pending supply cap.
     */
    function revokePendingCap(id) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "revokePendingCap",
            args: [id],
        });
    }
    MetaMorphoAction.revokePendingCap = revokePendingCap;
    /* FORCED MARKET REMOVAL */
    /**
     * Encodes a call to a MetaMorpho vault to submit a market removal.
     * @param marketParams The market params of the market to remove.
     */
    function submitMarketRemoval(marketParams) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "submitMarketRemoval",
            args: [marketParams],
        });
    }
    MetaMorphoAction.submitMarketRemoval = submitMarketRemoval;
    /**
     * Encodes a call to a MetaMorpho vault to accept the pending market removal.
     * @param id The id of the market of which to accept the removal.
     */
    function revokePendingMarketRemoval(id) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "revokePendingMarketRemoval",
            args: [id],
        });
    }
    MetaMorphoAction.revokePendingMarketRemoval = revokePendingMarketRemoval;
    /* GUARDIAN */
    /**
     * Encodes a call to a MetaMorpho vault to submit a new guardian.
     * @param newGuardian The address of the new guardian.
     */
    function submitGuardian(newGuardian) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "submitGuardian",
            args: [newGuardian],
        });
    }
    MetaMorphoAction.submitGuardian = submitGuardian;
    /**
     * Encodes a call to a MetaMorpho vault to accept the pending guardian.
     */
    function acceptGuardian() {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "acceptGuardian",
        });
    }
    MetaMorphoAction.acceptGuardian = acceptGuardian;
    /**
     * Encodes a call to a MetaMorpho vault to revoke the pending guardian.
     */
    function revokePendingGuardian() {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "revokePendingGuardian",
        });
    }
    MetaMorphoAction.revokePendingGuardian = revokePendingGuardian;
    /* MANAGEMENT */
    /**
     * Encodes a call to a MetaMorpho vault to skim ERC20 tokens.
     * @param erc20 The address of the ERC20 token to skim.
     */
    function skim(erc20) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "skim",
            args: [erc20],
        });
    }
    MetaMorphoAction.skim = skim;
    /**
     * Encodes a call to a MetaMorpho vault to set the supply queue.
     * @param supplyQueue The new supply queue.
     */
    function setSupplyQueue(supplyQueue) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "setSupplyQueue",
            args: [supplyQueue],
        });
    }
    MetaMorphoAction.setSupplyQueue = setSupplyQueue;
    /**
     * Encodes a call to a MetaMorpho vault to update the withdraw queue.
     * @param indexes The indexes of each market in the previous withdraw queue, in the new withdraw queue's order.
     */
    function updateWithdrawQueue(indexes) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "updateWithdrawQueue",
            args: [indexes],
        });
    }
    MetaMorphoAction.updateWithdrawQueue = updateWithdrawQueue;
    /**
     * Encodes a call to a MetaMorpho vault to reallocate the vault's liquidity across enabled markets.
     * @param allocations The new target allocations of each market.
     */
    function reallocate(allocations) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "reallocate",
            args: [allocations],
        });
    }
    MetaMorphoAction.reallocate = reallocate;
    /* ERC4626 */
    /**
     * Encodes a call to a MetaMorpho vault to mint shares.
     * @param shares The amount of shares to mint.
     * @param receiver The address of the receiver of the shares.
     */
    function mint(shares, receiver) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "mint",
            args: [shares, receiver],
        });
    }
    MetaMorphoAction.mint = mint;
    /**
     * Encodes a call to a MetaMorpho vault to deposit assets.
     * @param assets The amount of assets to deposit.
     * @param receiver The address of the receiver of the shares.
     */
    function deposit(assets, receiver) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "deposit",
            args: [assets, receiver],
        });
    }
    MetaMorphoAction.deposit = deposit;
    /**
     * Encodes a call to a MetaMorpho vault to withdraw assets.
     * @param assets The amount of assets to withdraw.
     * @param receiver The address of the receiver of the assets.
     * @param owner The address of the owner of the shares to redeem.
     */
    function withdraw(assets, receiver, owner) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "withdraw",
            args: [assets, receiver, owner],
        });
    }
    MetaMorphoAction.withdraw = withdraw;
    /**
     * Encodes a call to a MetaMorpho vault to redeem shares.
     * @param shares The amount of shares to redeem.
     * @param receiver The address of the receiver of the assets.
     * @param owner The address of the owner of the shares to redeem.
     */
    function redeem(shares, receiver, owner) {
        return (0, viem_1.encodeFunctionData)({
            abi: abis_1.metaMorphoAbi,
            functionName: "redeem",
            args: [shares, receiver, owner],
        });
    }
    MetaMorphoAction.redeem = redeem;
})(MetaMorphoAction || (exports.MetaMorphoAction = MetaMorphoAction = {}));
exports.default = MetaMorphoAction;
