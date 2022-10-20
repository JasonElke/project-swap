import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { ProjectSwap } from "../target/types/project_swap";

describe("project-swap", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.ProjectSwap as Program<ProjectSwap>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
