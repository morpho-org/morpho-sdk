export declare const erc2612Abi: readonly [{
    readonly inputs: readonly [];
    readonly name: "DOMAIN_SEPARATOR";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }];
    readonly name: "nonces";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "deadline";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint8";
        readonly name: "v";
        readonly type: "uint8";
    }, {
        readonly internalType: "bytes32";
        readonly name: "r";
        readonly type: "bytes32";
    }, {
        readonly internalType: "bytes32";
        readonly name: "s";
        readonly type: "bytes32";
    }];
    readonly name: "permit";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
export declare const permit2Abi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "deadline";
        readonly type: "uint256";
    }];
    readonly name: "AllowanceExpired";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "ExcessiveInvalidation";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "InsufficientAllowance";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "maxAmount";
        readonly type: "uint256";
    }];
    readonly name: "InvalidAmount";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InvalidContractSignature";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InvalidNonce";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InvalidSignature";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InvalidSignatureLength";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InvalidSigner";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "LengthMismatch";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "signatureDeadline";
        readonly type: "uint256";
    }];
    readonly name: "SignatureExpired";
    readonly type: "error";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint160";
        readonly name: "amount";
        readonly type: "uint160";
    }, {
        readonly indexed: false;
        readonly internalType: "uint48";
        readonly name: "expiration";
        readonly type: "uint48";
    }];
    readonly name: "Approval";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }];
    readonly name: "Lockdown";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint48";
        readonly name: "newNonce";
        readonly type: "uint48";
    }, {
        readonly indexed: false;
        readonly internalType: "uint48";
        readonly name: "oldNonce";
        readonly type: "uint48";
    }];
    readonly name: "NonceInvalidation";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint160";
        readonly name: "amount";
        readonly type: "uint160";
    }, {
        readonly indexed: false;
        readonly internalType: "uint48";
        readonly name: "expiration";
        readonly type: "uint48";
    }, {
        readonly indexed: false;
        readonly internalType: "uint48";
        readonly name: "nonce";
        readonly type: "uint48";
    }];
    readonly name: "Permit";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "word";
        readonly type: "uint256";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "mask";
        readonly type: "uint256";
    }];
    readonly name: "UnorderedNonceInvalidation";
    readonly type: "event";
}, {
    readonly inputs: readonly [];
    readonly name: "DOMAIN_SEPARATOR";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "allowance";
    readonly outputs: readonly [{
        readonly internalType: "uint160";
        readonly name: "amount";
        readonly type: "uint160";
    }, {
        readonly internalType: "uint48";
        readonly name: "expiration";
        readonly type: "uint48";
    }, {
        readonly internalType: "uint48";
        readonly name: "nonce";
        readonly type: "uint48";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint160";
        readonly name: "amount";
        readonly type: "uint160";
    }, {
        readonly internalType: "uint48";
        readonly name: "expiration";
        readonly type: "uint48";
    }];
    readonly name: "approve";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint48";
        readonly name: "newNonce";
        readonly type: "uint48";
    }];
    readonly name: "invalidateNonces";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "wordPos";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "mask";
        readonly type: "uint256";
    }];
    readonly name: "invalidateUnorderedNonces";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "spender";
            readonly type: "address";
        }];
        readonly internalType: "struct IAllowanceTransfer.TokenSpenderPair[]";
        readonly name: "approvals";
        readonly type: "tuple[]";
    }];
    readonly name: "lockdown";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly name: "nonceBitmap";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "token";
                readonly type: "address";
            }, {
                readonly internalType: "uint160";
                readonly name: "amount";
                readonly type: "uint160";
            }, {
                readonly internalType: "uint48";
                readonly name: "expiration";
                readonly type: "uint48";
            }, {
                readonly internalType: "uint48";
                readonly name: "nonce";
                readonly type: "uint48";
            }];
            readonly internalType: "struct IAllowanceTransfer.PermitDetails";
            readonly name: "details";
            readonly type: "tuple";
        }, {
            readonly internalType: "address";
            readonly name: "spender";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "sigDeadline";
            readonly type: "uint256";
        }];
        readonly internalType: "struct IAllowanceTransfer.PermitSingle";
        readonly name: "permitSingle";
        readonly type: "tuple";
    }, {
        readonly internalType: "bytes";
        readonly name: "signature";
        readonly type: "bytes";
    }];
    readonly name: "permit";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "token";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }];
            readonly internalType: "struct ISignatureTransfer.TokenPermissions";
            readonly name: "permitted";
            readonly type: "tuple";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "deadline";
            readonly type: "uint256";
        }];
        readonly internalType: "struct ISignatureTransfer.PermitTransferFrom";
        readonly name: "permit";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "requestedAmount";
            readonly type: "uint256";
        }];
        readonly internalType: "struct ISignatureTransfer.SignatureTransferDetails";
        readonly name: "transferDetails";
        readonly type: "tuple";
    }, {
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "signature";
        readonly type: "bytes";
    }];
    readonly name: "permitTransferFrom";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "token";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }];
            readonly internalType: "struct ISignatureTransfer.TokenPermissions[]";
            readonly name: "permitted";
            readonly type: "tuple[]";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "deadline";
            readonly type: "uint256";
        }];
        readonly internalType: "struct ISignatureTransfer.PermitBatchTransferFrom";
        readonly name: "permit";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "requestedAmount";
            readonly type: "uint256";
        }];
        readonly internalType: "struct ISignatureTransfer.SignatureTransferDetails[]";
        readonly name: "transferDetails";
        readonly type: "tuple[]";
    }, {
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "bytes";
        readonly name: "signature";
        readonly type: "bytes";
    }];
    readonly name: "permitTransferFrom";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "token";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }];
            readonly internalType: "struct ISignatureTransfer.TokenPermissions";
            readonly name: "permitted";
            readonly type: "tuple";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "deadline";
            readonly type: "uint256";
        }];
        readonly internalType: "struct ISignatureTransfer.PermitTransferFrom";
        readonly name: "permit";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "requestedAmount";
            readonly type: "uint256";
        }];
        readonly internalType: "struct ISignatureTransfer.SignatureTransferDetails";
        readonly name: "transferDetails";
        readonly type: "tuple";
    }, {
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "bytes32";
        readonly name: "witness";
        readonly type: "bytes32";
    }, {
        readonly internalType: "string";
        readonly name: "witnessTypeString";
        readonly type: "string";
    }, {
        readonly internalType: "bytes";
        readonly name: "signature";
        readonly type: "bytes";
    }];
    readonly name: "permitWitnessTransferFrom";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "token";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }];
            readonly internalType: "struct ISignatureTransfer.TokenPermissions[]";
            readonly name: "permitted";
            readonly type: "tuple[]";
        }, {
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "deadline";
            readonly type: "uint256";
        }];
        readonly internalType: "struct ISignatureTransfer.PermitBatchTransferFrom";
        readonly name: "permit";
        readonly type: "tuple";
    }, {
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "requestedAmount";
            readonly type: "uint256";
        }];
        readonly internalType: "struct ISignatureTransfer.SignatureTransferDetails[]";
        readonly name: "transferDetails";
        readonly type: "tuple[]";
    }, {
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "bytes32";
        readonly name: "witness";
        readonly type: "bytes32";
    }, {
        readonly internalType: "string";
        readonly name: "witnessTypeString";
        readonly type: "string";
    }, {
        readonly internalType: "bytes";
        readonly name: "signature";
        readonly type: "bytes";
    }];
    readonly name: "permitWitnessTransferFrom";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "from";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly internalType: "uint160";
            readonly name: "amount";
            readonly type: "uint160";
        }, {
            readonly internalType: "address";
            readonly name: "token";
            readonly type: "address";
        }];
        readonly internalType: "struct IAllowanceTransfer.AllowanceTransferDetails[]";
        readonly name: "transferDetails";
        readonly type: "tuple[]";
    }];
    readonly name: "transferFrom";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "from";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly internalType: "uint160";
        readonly name: "amount";
        readonly type: "uint160";
    }, {
        readonly internalType: "address";
        readonly name: "token";
        readonly type: "address";
    }];
    readonly name: "transferFrom";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
export declare const wstEthAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "contract IStETH";
        readonly name: "_stETH";
        readonly type: "address";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }];
    readonly name: "Approval";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "from";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }];
    readonly name: "Transfer";
    readonly type: "event";
}, {
    readonly inputs: readonly [];
    readonly name: "DOMAIN_SEPARATOR";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }];
    readonly name: "allowance";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "approve";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "balanceOf";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "decimals";
    readonly outputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "";
        readonly type: "uint8";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "subtractedValue";
        readonly type: "uint256";
    }];
    readonly name: "decreaseAllowance";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_wstETHAmount";
        readonly type: "uint256";
    }];
    readonly name: "getStETHByWstETH";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_stETHAmount";
        readonly type: "uint256";
    }];
    readonly name: "getWstETHByStETH";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "addedValue";
        readonly type: "uint256";
    }];
    readonly name: "increaseAllowance";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "name";
    readonly outputs: readonly [{
        readonly internalType: "string";
        readonly name: "";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }];
    readonly name: "nonces";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "deadline";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint8";
        readonly name: "v";
        readonly type: "uint8";
    }, {
        readonly internalType: "bytes32";
        readonly name: "r";
        readonly type: "bytes32";
    }, {
        readonly internalType: "bytes32";
        readonly name: "s";
        readonly type: "bytes32";
    }];
    readonly name: "permit";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "stETH";
    readonly outputs: readonly [{
        readonly internalType: "contract IStETH";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "stEthPerToken";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "symbol";
    readonly outputs: readonly [{
        readonly internalType: "string";
        readonly name: "";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "tokensPerStEth";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "totalSupply";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "transfer";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "transferFrom";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_wstETHAmount";
        readonly type: "uint256";
    }];
    readonly name: "unwrap";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "_stETHAmount";
        readonly type: "uint256";
    }];
    readonly name: "wrap";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly stateMutability: "payable";
    readonly type: "receive";
}];
export declare const blueAbi: readonly [{
    readonly type: "event";
    readonly name: "AccrueInterest";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "Id";
    }, {
        readonly name: "prevBorrowRate";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "interest";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "feeShares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Borrow";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "Id";
    }, {
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "onBehalf";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "receiver";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "CreateMarket";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "Id";
    }, {
        readonly name: "marketParams";
        readonly type: "tuple";
        readonly indexed: false;
        readonly internalType: "struct MarketParams";
        readonly components: readonly [{
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "oracle";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "irm";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "lltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "EnableIrm";
    readonly inputs: readonly [{
        readonly name: "irm";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "EnableLltv";
    readonly inputs: readonly [{
        readonly name: "lltv";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "FlashLoan";
    readonly inputs: readonly [{
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "token";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "IncrementNonce";
    readonly inputs: readonly [{
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "authorizer";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "usedNonce";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Liquidate";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "Id";
    }, {
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "borrower";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "repaidAssets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "repaidShares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "seizedAssets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "badDebtAssets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "badDebtShares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Repay";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "Id";
    }, {
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "onBehalf";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SetAuthorization";
    readonly inputs: readonly [{
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "authorizer";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "authorized";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newIsAuthorized";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SetFee";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "Id";
    }, {
        readonly name: "newFee";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SetFeeRecipient";
    readonly inputs: readonly [{
        readonly name: "newFeeRecipient";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SetOwner";
    readonly inputs: readonly [{
        readonly name: "newOwner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Supply";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "Id";
    }, {
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "onBehalf";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SupplyCollateral";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "Id";
    }, {
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "onBehalf";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Withdraw";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "Id";
    }, {
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "onBehalf";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "receiver";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "WithdrawCollateral";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "Id";
    }, {
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "onBehalf";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "receiver";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "constructor";
    readonly inputs: readonly [{
        readonly name: "newOwner";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "DOMAIN_SEPARATOR";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "accrueInterest";
    readonly inputs: readonly [{
        readonly name: "marketParams";
        readonly type: "tuple";
        readonly internalType: "struct MarketParams";
        readonly components: readonly [{
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "oracle";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "irm";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "lltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "borrow";
    readonly inputs: readonly [{
        readonly name: "marketParams";
        readonly type: "tuple";
        readonly internalType: "struct MarketParams";
        readonly components: readonly [{
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "oracle";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "irm";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "lltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "onBehalf";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "receiver";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "createMarket";
    readonly inputs: readonly [{
        readonly name: "marketParams";
        readonly type: "tuple";
        readonly internalType: "struct MarketParams";
        readonly components: readonly [{
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "oracle";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "irm";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "lltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "enableIrm";
    readonly inputs: readonly [{
        readonly name: "irm";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "enableLltv";
    readonly inputs: readonly [{
        readonly name: "lltv";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "extSloads";
    readonly inputs: readonly [{
        readonly name: "slots";
        readonly type: "bytes32[]";
        readonly internalType: "bytes32[]";
    }];
    readonly outputs: readonly [{
        readonly name: "res";
        readonly type: "bytes32[]";
        readonly internalType: "bytes32[]";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "feeRecipient";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "flashLoan";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "data";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "idToMarketParams";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }];
    readonly outputs: readonly [{
        readonly name: "loanToken";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "collateralToken";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "oracle";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "irm";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "lltv";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "isAuthorized";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "isIrmEnabled";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "isLltvEnabled";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "liquidate";
    readonly inputs: readonly [{
        readonly name: "marketParams";
        readonly type: "tuple";
        readonly internalType: "struct MarketParams";
        readonly components: readonly [{
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "oracle";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "irm";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "lltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly name: "borrower";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "seizedAssets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "repaidShares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "data";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "market";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }];
    readonly outputs: readonly [{
        readonly name: "totalSupplyAssets";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "totalSupplyShares";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "totalBorrowAssets";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "totalBorrowShares";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "lastUpdate";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "fee";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "nonce";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "owner";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "position";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }, {
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "supplyShares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "borrowShares";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "collateral";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "repay";
    readonly inputs: readonly [{
        readonly name: "marketParams";
        readonly type: "tuple";
        readonly internalType: "struct MarketParams";
        readonly components: readonly [{
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "oracle";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "irm";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "lltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "onBehalf";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "data";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setAuthorization";
    readonly inputs: readonly [{
        readonly name: "authorized";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "newIsAuthorized";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setAuthorizationWithSig";
    readonly inputs: readonly [{
        readonly name: "authorization";
        readonly type: "tuple";
        readonly internalType: "struct Authorization";
        readonly components: readonly [{
            readonly name: "authorizer";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "authorized";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "isAuthorized";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "nonce";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "deadline";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly name: "signature";
        readonly type: "tuple";
        readonly internalType: "struct Signature";
        readonly components: readonly [{
            readonly name: "v";
            readonly type: "uint8";
            readonly internalType: "uint8";
        }, {
            readonly name: "r";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "s";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }];
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setFee";
    readonly inputs: readonly [{
        readonly name: "marketParams";
        readonly type: "tuple";
        readonly internalType: "struct MarketParams";
        readonly components: readonly [{
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "oracle";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "irm";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "lltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly name: "newFee";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setFeeRecipient";
    readonly inputs: readonly [{
        readonly name: "newFeeRecipient";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setOwner";
    readonly inputs: readonly [{
        readonly name: "newOwner";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "supply";
    readonly inputs: readonly [{
        readonly name: "marketParams";
        readonly type: "tuple";
        readonly internalType: "struct MarketParams";
        readonly components: readonly [{
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "oracle";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "irm";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "lltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "onBehalf";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "data";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "supplyCollateral";
    readonly inputs: readonly [{
        readonly name: "marketParams";
        readonly type: "tuple";
        readonly internalType: "struct MarketParams";
        readonly components: readonly [{
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "oracle";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "irm";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "lltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "onBehalf";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "data";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "withdraw";
    readonly inputs: readonly [{
        readonly name: "marketParams";
        readonly type: "tuple";
        readonly internalType: "struct MarketParams";
        readonly components: readonly [{
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "oracle";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "irm";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "lltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "onBehalf";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "receiver";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "withdrawCollateral";
    readonly inputs: readonly [{
        readonly name: "marketParams";
        readonly type: "tuple";
        readonly internalType: "struct MarketParams";
        readonly components: readonly [{
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "oracle";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "irm";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "lltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "onBehalf";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "receiver";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}];
export declare const adaptiveCurveIrmAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "morpho";
        readonly type: "address";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly inputs: readonly [{
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly internalType: "uint256";
        readonly name: "avgBorrowRate";
        readonly type: "uint256";
        readonly indexed: false;
    }, {
        readonly internalType: "uint256";
        readonly name: "rateAtTarget";
        readonly type: "uint256";
        readonly indexed: false;
    }];
    readonly type: "event";
    readonly name: "BorrowRateUpdate";
    readonly anonymous: false;
}, {
    readonly inputs: readonly [];
    readonly stateMutability: "view";
    readonly type: "function";
    readonly name: "MORPHO";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
}, {
    readonly inputs: readonly [{
        readonly internalType: "struct MarketParams";
        readonly name: "marketParams";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "loanToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "collateralToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "oracle";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "irm";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "lltv";
            readonly type: "uint256";
        }];
    }, {
        readonly internalType: "struct Market";
        readonly name: "market";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly internalType: "uint128";
            readonly name: "totalSupplyAssets";
            readonly type: "uint128";
        }, {
            readonly internalType: "uint128";
            readonly name: "totalSupplyShares";
            readonly type: "uint128";
        }, {
            readonly internalType: "uint128";
            readonly name: "totalBorrowAssets";
            readonly type: "uint128";
        }, {
            readonly internalType: "uint128";
            readonly name: "totalBorrowShares";
            readonly type: "uint128";
        }, {
            readonly internalType: "uint128";
            readonly name: "lastUpdate";
            readonly type: "uint128";
        }, {
            readonly internalType: "uint128";
            readonly name: "fee";
            readonly type: "uint128";
        }];
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
    readonly name: "borrowRate";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly inputs: readonly [{
        readonly internalType: "struct MarketParams";
        readonly name: "marketParams";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "loanToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "collateralToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "oracle";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "irm";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "lltv";
            readonly type: "uint256";
        }];
    }, {
        readonly internalType: "struct Market";
        readonly name: "market";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly internalType: "uint128";
            readonly name: "totalSupplyAssets";
            readonly type: "uint128";
        }, {
            readonly internalType: "uint128";
            readonly name: "totalSupplyShares";
            readonly type: "uint128";
        }, {
            readonly internalType: "uint128";
            readonly name: "totalBorrowAssets";
            readonly type: "uint128";
        }, {
            readonly internalType: "uint128";
            readonly name: "totalBorrowShares";
            readonly type: "uint128";
        }, {
            readonly internalType: "uint128";
            readonly name: "lastUpdate";
            readonly type: "uint128";
        }, {
            readonly internalType: "uint128";
            readonly name: "fee";
            readonly type: "uint128";
        }];
    }];
    readonly stateMutability: "view";
    readonly type: "function";
    readonly name: "borrowRateView";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly inputs: readonly [{
        readonly internalType: "Id";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
    readonly name: "rateAtTarget";
    readonly outputs: readonly [{
        readonly internalType: "int256";
        readonly name: "";
        readonly type: "int256";
    }];
}];
export declare const blueOracleAbi: readonly [{
    readonly type: "function";
    readonly name: "price";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}];
export declare const metaMorphoAbi: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "morpho";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "initialTimelock";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_asset";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_name";
        readonly type: "string";
        readonly internalType: "string";
    }, {
        readonly name: "_symbol";
        readonly type: "string";
        readonly internalType: "string";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "DECIMALS_OFFSET";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "DOMAIN_SEPARATOR";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "MORPHO";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract IMorpho";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "acceptCap";
    readonly inputs: readonly [{
        readonly name: "marketParams";
        readonly type: "tuple";
        readonly internalType: "struct MarketParams";
        readonly components: readonly [{
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "oracle";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "irm";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "lltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "acceptGuardian";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "acceptOwnership";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "acceptTimelock";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "allowance";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "spender";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "approve";
    readonly inputs: readonly [{
        readonly name: "spender";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "value";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "asset";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "balanceOf";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "config";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }];
    readonly outputs: readonly [{
        readonly name: "cap";
        readonly type: "uint184";
        readonly internalType: "uint184";
    }, {
        readonly name: "enabled";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "removableAt";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "convertToAssets";
    readonly inputs: readonly [{
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "convertToShares";
    readonly inputs: readonly [{
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "curator";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "decimals";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "deposit";
    readonly inputs: readonly [{
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "receiver";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "eip712Domain";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "fields";
        readonly type: "bytes1";
        readonly internalType: "bytes1";
    }, {
        readonly name: "name";
        readonly type: "string";
        readonly internalType: "string";
    }, {
        readonly name: "version";
        readonly type: "string";
        readonly internalType: "string";
    }, {
        readonly name: "chainId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "verifyingContract";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "salt";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "extensions";
        readonly type: "uint256[]";
        readonly internalType: "uint256[]";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "fee";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint96";
        readonly internalType: "uint96";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "feeRecipient";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "guardian";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "isAllocator";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "lastTotalAssets";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "lostAssets";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "maxDeposit";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "maxMint";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "maxRedeem";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "maxWithdraw";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "mint";
    readonly inputs: readonly [{
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "receiver";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "multicall";
    readonly inputs: readonly [{
        readonly name: "data";
        readonly type: "bytes[]";
        readonly internalType: "bytes[]";
    }];
    readonly outputs: readonly [{
        readonly name: "results";
        readonly type: "bytes[]";
        readonly internalType: "bytes[]";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "name";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "string";
        readonly internalType: "string";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "nonces";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "owner";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "pendingCap";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }];
    readonly outputs: readonly [{
        readonly name: "value";
        readonly type: "uint192";
        readonly internalType: "uint192";
    }, {
        readonly name: "validAt";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "pendingGuardian";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "value";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "validAt";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "pendingOwner";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "pendingTimelock";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "value";
        readonly type: "uint192";
        readonly internalType: "uint192";
    }, {
        readonly name: "validAt";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "permit";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "spender";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "value";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "deadline";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "v";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "r";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "s";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "previewDeposit";
    readonly inputs: readonly [{
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "previewMint";
    readonly inputs: readonly [{
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "previewRedeem";
    readonly inputs: readonly [{
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "previewWithdraw";
    readonly inputs: readonly [{
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "reallocate";
    readonly inputs: readonly [{
        readonly name: "allocations";
        readonly type: "tuple[]";
        readonly internalType: "struct MarketAllocation[]";
        readonly components: readonly [{
            readonly name: "marketParams";
            readonly type: "tuple";
            readonly internalType: "struct MarketParams";
            readonly components: readonly [{
                readonly name: "loanToken";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "collateralToken";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "oracle";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "irm";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "lltv";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }];
        }, {
            readonly name: "assets";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "redeem";
    readonly inputs: readonly [{
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "receiver";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "renounceOwnership";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "revokePendingCap";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "revokePendingGuardian";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "revokePendingMarketRemoval";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "revokePendingTimelock";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setCurator";
    readonly inputs: readonly [{
        readonly name: "newCurator";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setFee";
    readonly inputs: readonly [{
        readonly name: "newFee";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setFeeRecipient";
    readonly inputs: readonly [{
        readonly name: "newFeeRecipient";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setIsAllocator";
    readonly inputs: readonly [{
        readonly name: "newAllocator";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "newIsAllocator";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setSkimRecipient";
    readonly inputs: readonly [{
        readonly name: "newSkimRecipient";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setSupplyQueue";
    readonly inputs: readonly [{
        readonly name: "newSupplyQueue";
        readonly type: "bytes32[]";
        readonly internalType: "Id[]";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "skim";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "skimRecipient";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "submitCap";
    readonly inputs: readonly [{
        readonly name: "marketParams";
        readonly type: "tuple";
        readonly internalType: "struct MarketParams";
        readonly components: readonly [{
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "oracle";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "irm";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "lltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly name: "newSupplyCap";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "submitGuardian";
    readonly inputs: readonly [{
        readonly name: "newGuardian";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "submitMarketRemoval";
    readonly inputs: readonly [{
        readonly name: "marketParams";
        readonly type: "tuple";
        readonly internalType: "struct MarketParams";
        readonly components: readonly [{
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "oracle";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "irm";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "lltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "submitTimelock";
    readonly inputs: readonly [{
        readonly name: "newTimelock";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "supplyQueue";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "supplyQueueLength";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "symbol";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "string";
        readonly internalType: "string";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "timelock";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "totalAssets";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "totalSupply";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "transfer";
    readonly inputs: readonly [{
        readonly name: "to";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "value";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "transferFrom";
    readonly inputs: readonly [{
        readonly name: "from";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "to";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "value";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "transferOwnership";
    readonly inputs: readonly [{
        readonly name: "newOwner";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "updateWithdrawQueue";
    readonly inputs: readonly [{
        readonly name: "indexes";
        readonly type: "uint256[]";
        readonly internalType: "uint256[]";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "withdraw";
    readonly inputs: readonly [{
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "receiver";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "withdrawQueue";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "withdrawQueueLength";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "event";
    readonly name: "AccrueInterest";
    readonly inputs: readonly [{
        readonly name: "newTotalAssets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "feeShares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Approval";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "spender";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "value";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Deposit";
    readonly inputs: readonly [{
        readonly name: "sender";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "EIP712DomainChanged";
    readonly inputs: readonly [];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "OwnershipTransferStarted";
    readonly inputs: readonly [{
        readonly name: "previousOwner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newOwner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "OwnershipTransferred";
    readonly inputs: readonly [{
        readonly name: "previousOwner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newOwner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ReallocateSupply";
    readonly inputs: readonly [{
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "Id";
    }, {
        readonly name: "suppliedAssets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "suppliedShares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ReallocateWithdraw";
    readonly inputs: readonly [{
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "Id";
    }, {
        readonly name: "withdrawnAssets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "withdrawnShares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "RevokePendingCap";
    readonly inputs: readonly [{
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "Id";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "RevokePendingGuardian";
    readonly inputs: readonly [{
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "RevokePendingMarketRemoval";
    readonly inputs: readonly [{
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "Id";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "RevokePendingTimelock";
    readonly inputs: readonly [{
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SetCap";
    readonly inputs: readonly [{
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "Id";
    }, {
        readonly name: "cap";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SetCurator";
    readonly inputs: readonly [{
        readonly name: "newCurator";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SetFee";
    readonly inputs: readonly [{
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newFee";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SetFeeRecipient";
    readonly inputs: readonly [{
        readonly name: "newFeeRecipient";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SetGuardian";
    readonly inputs: readonly [{
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "guardian";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SetIsAllocator";
    readonly inputs: readonly [{
        readonly name: "allocator";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "isAllocator";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SetName";
    readonly inputs: readonly [{
        readonly name: "name";
        readonly type: "string";
        readonly indexed: false;
        readonly internalType: "string";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SetSymbol";
    readonly inputs: readonly [{
        readonly name: "symbol";
        readonly type: "string";
        readonly indexed: false;
        readonly internalType: "string";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SetSkimRecipient";
    readonly inputs: readonly [{
        readonly name: "newSkimRecipient";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SetSupplyQueue";
    readonly inputs: readonly [{
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newSupplyQueue";
        readonly type: "bytes32[]";
        readonly indexed: false;
        readonly internalType: "Id[]";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SetTimelock";
    readonly inputs: readonly [{
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newTimelock";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SetWithdrawQueue";
    readonly inputs: readonly [{
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newWithdrawQueue";
        readonly type: "bytes32[]";
        readonly indexed: false;
        readonly internalType: "Id[]";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Skim";
    readonly inputs: readonly [{
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "token";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SubmitCap";
    readonly inputs: readonly [{
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "Id";
    }, {
        readonly name: "cap";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SubmitGuardian";
    readonly inputs: readonly [{
        readonly name: "newGuardian";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SubmitMarketRemoval";
    readonly inputs: readonly [{
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "Id";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SubmitTimelock";
    readonly inputs: readonly [{
        readonly name: "newTimelock";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Transfer";
    readonly inputs: readonly [{
        readonly name: "from";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "to";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "value";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "UpdateLastTotalAssets";
    readonly inputs: readonly [{
        readonly name: "updatedTotalAssets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Withdraw";
    readonly inputs: readonly [{
        readonly name: "sender";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "receiver";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "error";
    readonly name: "AboveMaxTimelock";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "AddressEmptyCode";
    readonly inputs: readonly [{
        readonly name: "target";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "AddressInsufficientBalance";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "AllCapsReached";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "AlreadyPending";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "AlreadySet";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "BelowMinTimelock";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "DuplicateMarket";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }];
}, {
    readonly type: "error";
    readonly name: "ECDSAInvalidSignature";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ECDSAInvalidSignatureLength";
    readonly inputs: readonly [{
        readonly name: "length";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "ECDSAInvalidSignatureS";
    readonly inputs: readonly [{
        readonly name: "s";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC20InsufficientAllowance";
    readonly inputs: readonly [{
        readonly name: "spender";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "allowance";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "needed";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC20InsufficientBalance";
    readonly inputs: readonly [{
        readonly name: "sender";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "balance";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "needed";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC20InvalidApprover";
    readonly inputs: readonly [{
        readonly name: "approver";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC20InvalidReceiver";
    readonly inputs: readonly [{
        readonly name: "receiver";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC20InvalidSender";
    readonly inputs: readonly [{
        readonly name: "sender";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC20InvalidSpender";
    readonly inputs: readonly [{
        readonly name: "spender";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC2612ExpiredSignature";
    readonly inputs: readonly [{
        readonly name: "deadline";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC2612InvalidSigner";
    readonly inputs: readonly [{
        readonly name: "signer";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC4626ExceededMaxDeposit";
    readonly inputs: readonly [{
        readonly name: "receiver";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "max";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC4626ExceededMaxMint";
    readonly inputs: readonly [{
        readonly name: "receiver";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "max";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC4626ExceededMaxRedeem";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "max";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC4626ExceededMaxWithdraw";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "assets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "max";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "FailedInnerCall";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InconsistentAsset";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }];
}, {
    readonly type: "error";
    readonly name: "InconsistentReallocation";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidAccountNonce";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "currentNonce";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "InvalidMarketRemovalNonZeroCap";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }];
}, {
    readonly type: "error";
    readonly name: "InvalidMarketRemovalNonZeroSupply";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }];
}, {
    readonly type: "error";
    readonly name: "InvalidMarketRemovalTimelockNotElapsed";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }];
}, {
    readonly type: "error";
    readonly name: "InvalidShortString";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "MarketNotCreated";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "MarketNotEnabled";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }];
}, {
    readonly type: "error";
    readonly name: "MathOverflowedMulDiv";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "MaxFeeExceeded";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "MaxQueueLengthExceeded";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NoPendingValue";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NonZeroCap";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotAllocatorRole";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotCuratorNorGuardianRole";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotCuratorRole";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotEnoughLiquidity";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotGuardianRole";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "OwnableInvalidOwner";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "OwnableUnauthorizedAccount";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "PendingCap";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }];
}, {
    readonly type: "error";
    readonly name: "PendingRemoval";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "SafeCastOverflowedUintDowncast";
    readonly inputs: readonly [{
        readonly name: "bits";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "value";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "SafeERC20FailedOperation";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "StringTooLong";
    readonly inputs: readonly [{
        readonly name: "str";
        readonly type: "string";
        readonly internalType: "string";
    }];
}, {
    readonly type: "error";
    readonly name: "SupplyCapExceeded";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }];
}, {
    readonly type: "error";
    readonly name: "TimelockNotElapsed";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "UnauthorizedMarket";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }];
}, {
    readonly type: "error";
    readonly name: "ZeroAddress";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ZeroFeeRecipient";
    readonly inputs: readonly [];
}];
export declare const publicAllocatorAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "morpho";
        readonly type: "address";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly inputs: readonly [];
    readonly name: "AlreadySet";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "DepositMarketInWithdrawals";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "EmptyWithdrawals";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InconsistentWithdrawals";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "IncorrectFee";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }];
    readonly name: "MarketNotEnabled";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }];
    readonly name: "MaxInflowExceeded";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }];
    readonly name: "MaxOutflowExceeded";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "MaxSettableFlowCapExceeded";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "NotAdminNorVaultOwner";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }];
    readonly name: "NotEnoughSupply";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }];
    readonly name: "WithdrawZero";
    readonly type: "error";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "Id";
        readonly name: "supplyMarketId";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "suppliedAssets";
        readonly type: "uint256";
    }];
    readonly name: "PublicReallocateTo";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "Id";
        readonly name: "id";
        readonly type: "bytes32";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "withdrawnAssets";
        readonly type: "uint256";
    }];
    readonly name: "PublicWithdrawal";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "admin";
        readonly type: "address";
    }];
    readonly name: "SetAdmin";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "fee";
        readonly type: "uint256";
    }];
    readonly name: "SetFee";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly components: readonly [{
            readonly internalType: "Id";
            readonly name: "id";
            readonly type: "bytes32";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint128";
                readonly name: "maxIn";
                readonly type: "uint128";
            }, {
                readonly internalType: "uint128";
                readonly name: "maxOut";
                readonly type: "uint128";
            }];
            readonly internalType: "struct FlowCaps";
            readonly name: "caps";
            readonly type: "tuple";
        }];
        readonly indexed: false;
        readonly internalType: "struct FlowCapsConfig[]";
        readonly name: "config";
        readonly type: "tuple[]";
    }];
    readonly name: "SetFlowCaps";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "feeRecipient";
        readonly type: "address";
    }];
    readonly name: "TransferFee";
    readonly type: "event";
}, {
    readonly inputs: readonly [];
    readonly name: "MORPHO";
    readonly outputs: readonly [{
        readonly internalType: "contract IMorpho";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "accruedFee";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "admin";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly name: "fee";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }, {
        readonly internalType: "Id";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly name: "flowCaps";
    readonly outputs: readonly [{
        readonly internalType: "uint128";
        readonly name: "maxIn";
        readonly type: "uint128";
    }, {
        readonly internalType: "uint128";
        readonly name: "maxOut";
        readonly type: "uint128";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly components: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "loanToken";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "collateralToken";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "oracle";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "irm";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "lltv";
                readonly type: "uint256";
            }];
            readonly internalType: "struct MarketParams";
            readonly name: "marketParams";
            readonly type: "tuple";
        }, {
            readonly internalType: "uint128";
            readonly name: "amount";
            readonly type: "uint128";
        }];
        readonly internalType: "struct Withdrawal[]";
        readonly name: "withdrawals";
        readonly type: "tuple[]";
    }, {
        readonly components: readonly [{
            readonly internalType: "address";
            readonly name: "loanToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "collateralToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "oracle";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "irm";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "lltv";
            readonly type: "uint256";
        }];
        readonly internalType: "struct MarketParams";
        readonly name: "supplyMarketParams";
        readonly type: "tuple";
    }];
    readonly name: "reallocateTo";
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "newAdmin";
        readonly type: "address";
    }];
    readonly name: "setAdmin";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "newFee";
        readonly type: "uint256";
    }];
    readonly name: "setFee";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly components: readonly [{
            readonly internalType: "Id";
            readonly name: "id";
            readonly type: "bytes32";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint128";
                readonly name: "maxIn";
                readonly type: "uint128";
            }, {
                readonly internalType: "uint128";
                readonly name: "maxOut";
                readonly type: "uint128";
            }];
            readonly internalType: "struct FlowCaps";
            readonly name: "caps";
            readonly type: "tuple";
        }];
        readonly internalType: "struct FlowCapsConfig[]";
        readonly name: "config";
        readonly type: "tuple[]";
    }];
    readonly name: "setFlowCaps";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "vault";
        readonly type: "address";
    }, {
        readonly internalType: "address payable";
        readonly name: "feeRecipient";
        readonly type: "address";
    }];
    readonly name: "transferFee";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
export declare const wrappedBackedTokenAbi: readonly [{
    readonly inputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "from";
        readonly type: "address";
    }];
    readonly name: "NonWhitelistedFromAddress";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }];
    readonly name: "NonWhitelistedToAddress";
    readonly type: "error";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }];
    readonly name: "Approval";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [];
    readonly name: "EIP712DomainChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint8";
        readonly name: "version";
        readonly type: "uint8";
    }];
    readonly name: "Initialized";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "previousOwner";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "newOwner";
        readonly type: "address";
    }];
    readonly name: "OwnershipTransferred";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "Paused";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "from";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }];
    readonly name: "Transfer";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "whitelistedBy";
        readonly type: "address";
    }];
    readonly name: "TransferDestinationAuthorized";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "from";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "whitelistedBy";
        readonly type: "address";
    }];
    readonly name: "TransferOriginatorAuthorized";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "Unpaused";
    readonly type: "event";
}, {
    readonly inputs: readonly [];
    readonly name: "DOMAIN_SEPARATOR";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }];
    readonly name: "allowance";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "approve";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "balanceOf";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "decimals";
    readonly outputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "";
        readonly type: "uint8";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "subtractedValue";
        readonly type: "uint256";
    }];
    readonly name: "decreaseAllowance";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "depositFor";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "eip712Domain";
    readonly outputs: readonly [{
        readonly internalType: "bytes1";
        readonly name: "fields";
        readonly type: "bytes1";
    }, {
        readonly internalType: "string";
        readonly name: "name";
        readonly type: "string";
    }, {
        readonly internalType: "string";
        readonly name: "version";
        readonly type: "string";
    }, {
        readonly internalType: "uint256";
        readonly name: "chainId";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "verifyingContract";
        readonly type: "address";
    }, {
        readonly internalType: "bytes32";
        readonly name: "salt";
        readonly type: "bytes32";
    }, {
        readonly internalType: "uint256[]";
        readonly name: "extensions";
        readonly type: "uint256[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "addedValue";
        readonly type: "uint256";
    }];
    readonly name: "increaseAllowance";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "underlyingToken";
        readonly type: "address";
    }];
    readonly name: "initialize";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "name";
    readonly outputs: readonly [{
        readonly internalType: "string";
        readonly name: "";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }];
    readonly name: "nonces";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "owner";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "pause";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "paused";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "deadline";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint8";
        readonly name: "v";
        readonly type: "uint8";
    }, {
        readonly internalType: "bytes32";
        readonly name: "r";
        readonly type: "bytes32";
    }, {
        readonly internalType: "bytes32";
        readonly name: "s";
        readonly type: "bytes32";
    }];
    readonly name: "permit";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "renounceOwnership";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "controllerAggregator";
        readonly type: "address";
    }];
    readonly name: "setWhitelistController";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "symbol";
    readonly outputs: readonly [{
        readonly internalType: "string";
        readonly name: "";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "totalSupply";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "transfer";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "from";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "transferFrom";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "newOwner";
        readonly type: "address";
    }];
    readonly name: "transferOwnership";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "underlying";
    readonly outputs: readonly [{
        readonly internalType: "contract IERC20Upgradeable";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "unpause";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "whitelistControllerAggregator";
    readonly outputs: readonly [{
        readonly internalType: "contract WhitelistControllerAggregator";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly name: "withdrawTo";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
export declare const whitelistControllerAggregatorV2Abi: readonly [{
    readonly inputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "constructor";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "controller";
        readonly type: "address";
    }];
    readonly name: "AddedController";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: false;
        readonly internalType: "uint8";
        readonly name: "version";
        readonly type: "uint8";
    }];
    readonly name: "Initialized";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "previousOwner";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "newOwner";
        readonly type: "address";
    }];
    readonly name: "OwnershipTransferred";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "controller";
        readonly type: "address";
    }];
    readonly name: "RemovedController";
    readonly type: "event";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "controller";
        readonly type: "address";
    }];
    readonly name: "add";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly name: "controllers";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "initialize";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "addressToCheck";
        readonly type: "address";
    }];
    readonly name: "isWhitelisted";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "owner";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "index";
        readonly type: "uint256";
    }];
    readonly name: "remove";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "renounceOwnership";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "newOwner";
        readonly type: "address";
    }];
    readonly name: "transferOwnership";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
export declare const permissionedErc20WrapperAbi: readonly [{
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "target";
        readonly type: "address";
    }];
    readonly name: "AddressEmptyCode";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "ECDSAInvalidSignature";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "length";
        readonly type: "uint256";
    }];
    readonly name: "ECDSAInvalidSignatureLength";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "s";
        readonly type: "bytes32";
    }];
    readonly name: "ECDSAInvalidSignatureS";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "allowance";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "needed";
        readonly type: "uint256";
    }];
    readonly name: "ERC20InsufficientAllowance";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "balance";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "needed";
        readonly type: "uint256";
    }];
    readonly name: "ERC20InsufficientBalance";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "approver";
        readonly type: "address";
    }];
    readonly name: "ERC20InvalidApprover";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "receiver";
        readonly type: "address";
    }];
    readonly name: "ERC20InvalidReceiver";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "sender";
        readonly type: "address";
    }];
    readonly name: "ERC20InvalidSender";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }];
    readonly name: "ERC20InvalidSpender";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "token";
        readonly type: "address";
    }];
    readonly name: "ERC20InvalidUnderlying";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "deadline";
        readonly type: "uint256";
    }];
    readonly name: "ERC2612ExpiredSignature";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "signer";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }];
    readonly name: "ERC2612InvalidSigner";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "FailedCall";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "balance";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "needed";
        readonly type: "uint256";
    }];
    readonly name: "InsufficientBalance";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "currentNonce";
        readonly type: "uint256";
    }];
    readonly name: "InvalidAccountNonce";
    readonly type: "error";
}, {
    readonly inputs: readonly [];
    readonly name: "InvalidShortString";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "NoPermission";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "token";
        readonly type: "address";
    }];
    readonly name: "SafeERC20FailedOperation";
    readonly type: "error";
}, {
    readonly inputs: readonly [{
        readonly internalType: "string";
        readonly name: "str";
        readonly type: "string";
    }];
    readonly name: "StringTooLong";
    readonly type: "error";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }];
    readonly name: "Approval";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [];
    readonly name: "EIP712DomainChanged";
    readonly type: "event";
}, {
    readonly anonymous: false;
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "from";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }];
    readonly name: "Transfer";
    readonly type: "event";
}, {
    readonly inputs: readonly [];
    readonly name: "BUNDLER";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "DOMAIN_SEPARATOR";
    readonly outputs: readonly [{
        readonly internalType: "bytes32";
        readonly name: "";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "MORPHO";
    readonly outputs: readonly [{
        readonly internalType: "address";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }];
    readonly name: "allowance";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }];
    readonly name: "approve";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "balanceOf";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "decimals";
    readonly outputs: readonly [{
        readonly internalType: "uint8";
        readonly name: "";
        readonly type: "uint8";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }];
    readonly name: "depositFor";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "eip712Domain";
    readonly outputs: readonly [{
        readonly internalType: "bytes1";
        readonly name: "fields";
        readonly type: "bytes1";
    }, {
        readonly internalType: "string";
        readonly name: "name";
        readonly type: "string";
    }, {
        readonly internalType: "string";
        readonly name: "version";
        readonly type: "string";
    }, {
        readonly internalType: "uint256";
        readonly name: "chainId";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "verifyingContract";
        readonly type: "address";
    }, {
        readonly internalType: "bytes32";
        readonly name: "salt";
        readonly type: "bytes32";
    }, {
        readonly internalType: "uint256[]";
        readonly name: "extensions";
        readonly type: "uint256[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }];
    readonly name: "hasPermission";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "attested";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "name";
    readonly outputs: readonly [{
        readonly internalType: "string";
        readonly name: "";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }];
    readonly name: "nonces";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint256";
        readonly name: "deadline";
        readonly type: "uint256";
    }, {
        readonly internalType: "uint8";
        readonly name: "v";
        readonly type: "uint8";
    }, {
        readonly internalType: "bytes32";
        readonly name: "r";
        readonly type: "bytes32";
    }, {
        readonly internalType: "bytes32";
        readonly name: "s";
        readonly type: "bytes32";
    }];
    readonly name: "permit";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "symbol";
    readonly outputs: readonly [{
        readonly internalType: "string";
        readonly name: "";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "totalSupply";
    readonly outputs: readonly [{
        readonly internalType: "uint256";
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }];
    readonly name: "transfer";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "from";
        readonly type: "address";
    }, {
        readonly internalType: "address";
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }];
    readonly name: "transferFrom";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [];
    readonly name: "underlying";
    readonly outputs: readonly [{
        readonly internalType: "contract IERC20";
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly internalType: "address";
        readonly name: "account";
        readonly type: "address";
    }, {
        readonly internalType: "uint256";
        readonly name: "value";
        readonly type: "uint256";
    }];
    readonly name: "withdrawTo";
    readonly outputs: readonly [{
        readonly internalType: "bool";
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
export declare const erc5267Abi: readonly [{
    readonly inputs: readonly [];
    readonly name: "eip712Domain";
    readonly outputs: readonly [{
        readonly internalType: "bytes1";
        readonly name: "fields";
        readonly type: "bytes1";
    }, {
        readonly internalType: "string";
        readonly name: "name";
        readonly type: "string";
    }, {
        readonly internalType: "string";
        readonly name: "version";
        readonly type: "string";
    }, {
        readonly internalType: "uint256";
        readonly name: "chainId";
        readonly type: "uint256";
    }, {
        readonly internalType: "address";
        readonly name: "verifyingContract";
        readonly type: "address";
    }, {
        readonly internalType: "bytes32";
        readonly name: "salt";
        readonly type: "bytes32";
    }, {
        readonly internalType: "uint256[]";
        readonly name: "extensions";
        readonly type: "uint256[]";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}];
export declare const preLiquidationFactoryAbi: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [{
        readonly name: "morpho";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "MORPHO";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract IMorpho";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "createPreLiquidation";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }, {
        readonly name: "preLiquidationParams";
        readonly type: "tuple";
        readonly internalType: "struct PreLiquidationParams";
        readonly components: readonly [{
            readonly name: "preLltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLCF1";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLCF2";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLIF1";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLIF2";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLiquidationOracle";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract IPreLiquidation";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "isPreLiquidation";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "event";
    readonly name: "CreatePreLiquidation";
    readonly inputs: readonly [{
        readonly name: "preLiquidation";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: false;
        readonly internalType: "Id";
    }, {
        readonly name: "preLiquidationParams";
        readonly type: "tuple";
        readonly indexed: false;
        readonly internalType: "struct PreLiquidationParams";
        readonly components: readonly [{
            readonly name: "preLltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLCF1";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLCF2";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLIF1";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLIF2";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLiquidationOracle";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }];
    readonly anonymous: false;
}, {
    readonly type: "error";
    readonly name: "ZeroAddress";
    readonly inputs: readonly [];
}];
export declare const preLiquidationAbi: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [{
        readonly name: "morpho";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "id";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }, {
        readonly name: "_preLiquidationParams";
        readonly type: "tuple";
        readonly internalType: "struct PreLiquidationParams";
        readonly components: readonly [{
            readonly name: "preLltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLCF1";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLCF2";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLIF1";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLIF2";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLiquidationOracle";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "ID";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "Id";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "MORPHO";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract IMorpho";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "marketParams";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly internalType: "struct MarketParams";
        readonly components: readonly [{
            readonly name: "loanToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "collateralToken";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "oracle";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "irm";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "lltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "onMorphoRepay";
    readonly inputs: readonly [{
        readonly name: "repaidAssets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "callbackData";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "preLiquidate";
    readonly inputs: readonly [{
        readonly name: "borrower";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "seizedAssets";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "repaidShares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "data";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "preLiquidationParams";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly internalType: "struct PreLiquidationParams";
        readonly components: readonly [{
            readonly name: "preLltv";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLCF1";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLCF2";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLIF1";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLIF2";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "preLiquidationOracle";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "event";
    readonly name: "PreLiquidate";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "Id";
    }, {
        readonly name: "liquidator";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "borrower";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "repaidAssets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "repaidShares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "seizedAssets";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "error";
    readonly name: "InconsistentInput";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "LiquidatablePosition";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NonexistentMarket";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotMorpho";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotPreLiquidatablePosition";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "PreLCFDecreasing";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "PreLCFTooHigh";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "PreLIFDecreasing";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "PreLIFTooHigh";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "PreLIFTooLow";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "PreLiquidationTooLarge";
    readonly inputs: readonly [{
        readonly name: "repaidShares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "repayableShares";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
}, {
    readonly type: "error";
    readonly name: "PreLltvTooHigh";
    readonly inputs: readonly [];
}];
