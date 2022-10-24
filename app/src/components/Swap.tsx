import { FC, useState } from 'react';
import { PublicKey, Connection,  TransactionInstruction, SystemProgram} from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { notify } from "../utils/notifications";



import {
  makeStyles,
  Button,
} from "@material-ui/core";
import { SwapContextProvider, useInputSwapContext } from 'contexts/SwapProvider';
import useSwapProgram from 'hooks/useSwapProgram';
import { MOVE_TOKEN_MINT, POOL_SOL_MOVE_INFO } from 'config/constants';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as anchor from "@project-serum/anchor";


const useStyles = makeStyles((theme) => ({
  swapButton: {
    width: "100%",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontSize: 14,
    fontWeight: 700,
    padding: theme.spacing(1),
  }
}));

export const Swap: FC = () => {
  return (
    <div>
      <SwapContextProvider>
        <SwapForm />

      </SwapContextProvider>
    </div>
  );
};


export function SwapForm() {
  const { inputAmount, setInputAmount } = useInputSwapContext();
  return (
    <div className="flex flex-col space-between">
      <div>
        SWAP SOL TO MOVE TOKEN
      </div>

      <div className="max-w-full md:max-w-lg mt-5">
        <div>
          <label htmlFor="amount" className="block text-sm">
            Input Amount (SOL)
          </label>
          <div className="mt-1">
            <input
              name="amount"
              id="amount"
              className="shadow-sm bg-neutral p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={inputAmount}
              type="number"
              onInput={(e: any) => {
                let value = parseFloat(e.target.value);
                setInputAmount(value);
                console.log(`input amount = ${value}`);
              }}
            />
          </div>
        </div>
      </div>
      <div className='mt-1'>
        <SwapButton />
      </div>


    </div>
  );
}


export function SwapButton() {
  const styles = useStyles();
  const { inputAmount, setInputAmount } = useInputSwapContext();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const swapProgram = useSwapProgram(connection);


  const sendSwapTransaction = async () => {
    if (!publicKey) {
      console.log("error", "Wallet not connected!");
      notify({
        type: "error",
        message: "error",
        description: "Wallet not connected!",
      });
      return;
    }

    const [swapAuthority, bumpSeed] = await PublicKey.findProgramAddress(
      [POOL_SOL_MOVE_INFO.toBuffer()],
      swapProgram.programId
    );

    const poolInfo = await swapProgram.account.poolInfo.fetch(POOL_SOL_MOVE_INFO);

    const [userMoveAta, createUserMoveAtaTx] = await getOrCreateATAInstruction(MOVE_TOKEN_MINT, publicKey, connection);
    const preInstructions: Array<TransactionInstruction> = [];
    createUserMoveAtaTx && preInstructions.push(createUserMoveAtaTx);
    let lamports = inputAmount * 1e9;
    let txSwap = await swapProgram.methods
    .swap(new anchor.BN(lamports))
    .accounts({
      poolInfo: POOL_SOL_MOVE_INFO,
      swapAuthority: swapAuthority,
      userWallet: publicKey,
      userQuoteAccount: userMoveAta,
      poolNativeAccount: poolInfo.nativeAccountInfo,
      poolQuoteAccount: poolInfo.quoteTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .preInstructions(preInstructions)
    .transaction();

    console.log("txSwap= ", txSwap);
    let txHashSwap = await sendTransaction(txSwap, connection);
    notify({
      type: "success",
      message: "Swap successful!",
      txid: txHashSwap,
    });
    console.log(`txHashSwap: ${txHashSwap}`);
  }

  return (
    <Button
      variant="contained"
      className={styles.swapButton}
      disabled={Number.isNaN(inputAmount) || inputAmount <= 0}
      onClick={sendSwapTransaction}
    >
      Swap
    </Button>
  );
}


export const getOrCreateATAInstruction = async (
  tokenMint: PublicKey,
  owner: PublicKey,
  connection: Connection,
): Promise<[PublicKey, TransactionInstruction?]> => {
  let toAccount;
  try {
    toAccount = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, tokenMint, owner);
    const account = await connection.getAccountInfo(toAccount);
    if (!account) {
      const ix = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        tokenMint,
        toAccount,
        owner,
        owner,
      );
      return [toAccount, ix];
    }
    return [toAccount, undefined];
  } catch (e) {
    /* handle error */
    console.error('Error::getOrCreateATAInstruction', e);
    throw e;
  }
};