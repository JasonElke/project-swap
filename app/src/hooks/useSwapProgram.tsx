import { AnchorProvider, Program } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { POOL_SOL_MOVE_INFO, PROJECT_SWAP_PROGRAM_ID } from "config/constants";
import { IDL, ProjectSwap } from "config/project_swap";


export default function useSwapProgram(conn: Connection): Program<ProjectSwap> {
    const provider = new AnchorProvider(
        conn,
        {} as any,
        AnchorProvider.defaultOptions()
    );
    const program = new Program<ProjectSwap>(
        IDL,
        PROJECT_SWAP_PROGRAM_ID.toBase58(),
        provider
    );
    return program;
}

