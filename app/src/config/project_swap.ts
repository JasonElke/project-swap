export type ProjectSwap = {
    "version": "0.1.0",
    "name": "project_swap",
    "instructions": [
        {
            "name": "initPoolSwap",
            "accounts": [
                {
                    "name": "poolInfo",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "swapAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "quoteTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "nativeAccountInfo",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "initPrice",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "swap",
            "accounts": [
                {
                    "name": "poolInfo",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "swapAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "userWallet",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "userQuoteAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolNativeAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolQuoteAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "amountIn",
                    "type": "u64"
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "poolInfo",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "isInitialized",
                        "docs": [
                            "Initialized state"
                        ],
                        "type": "bool"
                    },
                    {
                        "name": "price",
                        "docs": [
                            "For each native token swapped receive `price` quote token"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "nativeAccountInfo",
                        "docs": [
                            "Account address hold native token when user deposit to pool"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "quoteTokenMint",
                        "docs": [
                            "Token mint address for swap"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "quoteTokenAccount",
                        "docs": [
                            "Token account address for record token mint balance, owned by pool"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "bumpSeed",
                        "type": "u8"
                    },
                    {
                        "name": "tokenProgramId",
                        "type": "publicKey"
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "AlreadyInUse",
            "msg": "Swap account already in use"
        },
        {
            "code": 6001,
            "name": "InvalidProgramAddress",
            "msg": "Invalid program address generated from bump seed and key"
        },
        {
            "code": 6002,
            "name": "InvalidOwner",
            "msg": "Input account owner is not the program address"
        },
        {
            "code": 6003,
            "name": "InvalidOutputOwner",
            "msg": "Output pool account owner cannot be the program address"
        },
        {
            "code": 6004,
            "name": "InvalidDelegate",
            "msg": "Token account has a delegate"
        },
        {
            "code": 6005,
            "name": "InvalidInput",
            "msg": "InvalidInput"
        },
        {
            "code": 6006,
            "name": "InvalidTokenAccount",
            "msg": "Address of the provided swap token account is incorrect"
        },
        {
            "code": 6007,
            "name": "InvalidNativeAccount",
            "msg": "Invalid native account"
        },
        {
            "code": 6008,
            "name": "InvalidCloseAuthority",
            "msg": "Token account has a close authority"
        },
        {
            "code": 6009,
            "name": "InvalidFreezeAuthority",
            "msg": "Pool token mint has a freeze authority"
        },
        {
            "code": 6010,
            "name": "IncorrectTokenProgramId",
            "msg": "The provided token program does not match the token program expected by the swap"
        }
    ]
};

export const IDL: ProjectSwap = {
    "version": "0.1.0",
    "name": "project_swap",
    "instructions": [
        {
            "name": "initPoolSwap",
            "accounts": [
                {
                    "name": "poolInfo",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "swapAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "quoteTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "nativeAccountInfo",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "initPrice",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "swap",
            "accounts": [
                {
                    "name": "poolInfo",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "swapAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "userWallet",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "userQuoteAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolNativeAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolQuoteAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "amountIn",
                    "type": "u64"
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "poolInfo",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "isInitialized",
                        "docs": [
                            "Initialized state"
                        ],
                        "type": "bool"
                    },
                    {
                        "name": "price",
                        "docs": [
                            "For each native token swapped receive `price` quote token"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "nativeAccountInfo",
                        "docs": [
                            "Account address hold native token when user deposit to pool"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "quoteTokenMint",
                        "docs": [
                            "Token mint address for swap"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "quoteTokenAccount",
                        "docs": [
                            "Token account address for record token mint balance, owned by pool"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "bumpSeed",
                        "type": "u8"
                    },
                    {
                        "name": "tokenProgramId",
                        "type": "publicKey"
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "AlreadyInUse",
            "msg": "Swap account already in use"
        },
        {
            "code": 6001,
            "name": "InvalidProgramAddress",
            "msg": "Invalid program address generated from bump seed and key"
        },
        {
            "code": 6002,
            "name": "InvalidOwner",
            "msg": "Input account owner is not the program address"
        },
        {
            "code": 6003,
            "name": "InvalidOutputOwner",
            "msg": "Output pool account owner cannot be the program address"
        },
        {
            "code": 6004,
            "name": "InvalidDelegate",
            "msg": "Token account has a delegate"
        },
        {
            "code": 6005,
            "name": "InvalidInput",
            "msg": "InvalidInput"
        },
        {
            "code": 6006,
            "name": "InvalidTokenAccount",
            "msg": "Address of the provided swap token account is incorrect"
        },
        {
            "code": 6007,
            "name": "InvalidNativeAccount",
            "msg": "Invalid native account"
        },
        {
            "code": 6008,
            "name": "InvalidCloseAuthority",
            "msg": "Token account has a close authority"
        },
        {
            "code": 6009,
            "name": "InvalidFreezeAuthority",
            "msg": "Pool token mint has a freeze authority"
        },
        {
            "code": 6010,
            "name": "IncorrectTokenProgramId",
            "msg": "The provided token program does not match the token program expected by the swap"
        }
    ]
};
