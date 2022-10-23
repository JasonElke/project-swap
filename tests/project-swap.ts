import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { ProjectSwap } from "../target/types/project_swap";

import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
  SystemProgram,
} from "@solana/web3.js";

import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { assert } from "chai";


describe("project-swap", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.ProjectSwap as Program<ProjectSwap>;

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Owner for create token mint and pay fee
  const owner = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from([21, 21, 67, 255, 79, 126, 27, 118, 154, 46, 185, 76, 113, 140, 171, 18, 232, 222, 215, 46, 186, 206, 165, 137, 136, 141, 91, 252, 97, 125, 90, 32, 168, 242, 53, 253, 141, 165, 12, 126, 138, 128, 97, 89, 199, 122, 181, 93, 149, 65, 251, 180, 82, 250, 71, 149, 202, 59, 38, 238, 149, 184, 241, 17])
  );
  console.log(`owner = ${owner.publicKey}`);

  // Pool info define
  let swapAuthority: PublicKey;
  let bumpSeed: number;
  let moveToken: Token;
  let poolMoveTokenAccount: PublicKey;

  const poolSolAccountInfo = new Keypair();
  console.log(`Create poolSolAccountInfo: \npubkey=${poolSolAccountInfo.publicKey} \nsecretKey= ${poolSolAccountInfo.secretKey}`)

  const poolInfoAccount = new Keypair();
  console.log(`Create pool info account = ${poolInfoAccount.publicKey.toBase58()}`);

  const INIT_AMOUNT_MOVE_TOKEN_IN_POOL = 1000000;
  const DEFAULT_TOKEN_DECIMALS = 9;

  const testUserWallet = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from([227, 172, 74, 151, 248, 155, 76, 39, 177, 150, 136, 178, 121, 55, 224, 103, 56, 131, 221, 60, 195, 148, 125, 96, 152, 160, 198, 106, 3, 213, 110, 124, 0, 38, 166, 147, 249, 82, 149, 49, 76, 28, 6, 149, 20, 117, 255, 88, 81, 108, 91, 140, 35, 237, 65, 163, 151, 31, 81, 219, 31, 227, 179, 202])
  );
  console.log(`test user wallet = ${testUserWallet.publicKey}`);

  it("Test init pool swap!", async () => {
    [swapAuthority, bumpSeed] = await PublicKey.findProgramAddress(
      [poolInfoAccount.publicKey.toBuffer()],
      program.programId
    );

    // Create MOVE token mint
    moveToken = await Token.createMint(
      connection,
      owner,
      owner.publicKey,
      null,
      DEFAULT_TOKEN_DECIMALS,
      TOKEN_PROGRAM_ID,
    );
    console.log(`MOVE token mint address = ${moveToken.publicKey}`);

    poolMoveTokenAccount = await moveToken.createAccount(swapAuthority);
    console.log(`Pool MOVE token account = ${poolMoveTokenAccount}`);

    // Mint init amount to MOVE token account in pool
    await moveToken.mintTo(
      poolMoveTokenAccount,
      owner,
      [],
      INIT_AMOUNT_MOVE_TOKEN_IN_POOL * Math.pow(10, DEFAULT_TOKEN_DECIMALS)
    );

    const initPrice = new anchor.BN(10);
    console.log(`Init price in pool = ${initPrice.toNumber()}`);
    let txInitPoolSwap = await program.methods
      .initPoolSwap(initPrice)
      .accounts({
        poolInfo: poolInfoAccount.publicKey,
        swapAuthority: swapAuthority,
        quoteTokenAccount: poolMoveTokenAccount,
        nativeAccountInfo: poolSolAccountInfo.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([poolInfoAccount])
      .preInstructions([await program.account.poolInfo.createInstruction(poolInfoAccount)])
      .rpc();

    console.log(`tx hash init pool swap = ${txInitPoolSwap}`);

    console.log('loading pool swap...');
    const fetchedPoolSwap = await program.account.poolInfo.fetch(poolInfoAccount.publicKey);

    assert(fetchedPoolSwap.tokenProgramId.equals(TOKEN_PROGRAM_ID));
    assert(fetchedPoolSwap.isInitialized == true);
    assert(fetchedPoolSwap.quoteTokenAccount.equals(poolMoveTokenAccount));
    assert(fetchedPoolSwap.nativeAccountInfo.equals(poolSolAccountInfo.publicKey));
    assert(fetchedPoolSwap.price.toNumber() == initPrice.toNumber());

  });

  it("Test swap SOL to MOVE!", async () => {
    const userMoveAccountInfo = await moveToken.getOrCreateAssociatedAccountInfo(testUserWallet.publicKey);
    const userMoveAccount = userMoveAccountInfo.address;

    console.log(`user MOVE token account = ${userMoveAccount.toBase58()}`);

    const amountIn = new anchor.BN(1e8); // 0.1 SOL

    const userMoveInfoBefore = await moveToken.getAccountInfo(userMoveAccount);
    const userSolBalanceBefore = await connection.getBalance(testUserWallet.publicKey);
    const poolSolBalanceBefore = await connection.getBalance(poolSolAccountInfo.publicKey);
    const poolMoveInfoBefore = await moveToken.getAccountInfo(poolMoveTokenAccount);

    let txSwap = await program.methods
      .swap(amountIn)
      .accounts({
        poolInfo: poolInfoAccount.publicKey,
        swapAuthority: swapAuthority,
        userWallet: testUserWallet.publicKey,
        userQuoteAccount: userMoveAccount,
        poolNativeAccount: poolSolAccountInfo.publicKey,
        poolQuoteAccount: poolMoveTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([testUserWallet])
      .rpc();

    console.log(`tx hash swap = ${txSwap}`);

    console.log('loading pool swap...');

    const userMoveInfoAfter = await moveToken.getAccountInfo(userMoveAccount);
    const userSolBalanceAfter = await connection.getBalance(testUserWallet.publicKey);
    const poolSolBalanceAfter = await connection.getBalance(poolSolAccountInfo.publicKey);
    const poolMoveInfoAfter = await moveToken.getAccountInfo(poolMoveTokenAccount);
    assert(userMoveInfoAfter.amount.toNumber() - userMoveInfoBefore.amount.toNumber() == 1e9);
    assert(poolSolBalanceAfter - poolSolBalanceBefore == 1e8);
    assert(userSolBalanceBefore - userSolBalanceAfter == 1e8);
    assert(poolMoveInfoBefore.amount.toNumber() - poolMoveInfoAfter.amount.toNumber() == 1e9);
  });
});
