pub mod errors;

use anchor_lang::{prelude::*, solana_program};
use anchor_spl::token::{self, TokenAccount, Transfer};

use errors::*;

declare_id!("3kttdpDFZfHq61Q8WXCxbdyQNYPenmt9uhibTN7shHkZ");

#[program]
pub mod project_swap {
    use super::*;

    pub fn init_pool_swap(ctx: Context<InitPoolSwap>, init_price: u64) -> Result<()> {
        if ctx.accounts.pool_info.is_initialized {
            return Err(SwapError::AlreadyInUse.into());
        }

        let (swap_authority, bump_seed) = Pubkey::find_program_address(
            &[&ctx.accounts.pool_info.to_account_info().key.to_bytes()],
            ctx.program_id,
        );

        if *ctx.accounts.swap_authority.key != swap_authority {
            return Err(SwapError::InvalidProgramAddress.into());
        }

        if *ctx.accounts.swap_authority.key != ctx.accounts.quote_token_account.owner {
            return Err(SwapError::InvalidOwner.into());
        }

        if ctx.accounts.quote_token_account.delegate.is_some() {
            return Err(SwapError::InvalidDelegate.into());
        }

        if ctx.accounts.quote_token_account.close_authority.is_some() {
            return Err(SwapError::InvalidCloseAuthority.into());
        }

        let pool_info = &mut ctx.accounts.pool_info;

        pool_info.is_initialized = true;
        pool_info.price = init_price;
        pool_info.bump_seed = bump_seed;
        pool_info.token_program_id = *ctx.accounts.token_program.key;
        pool_info.native_account_info = *ctx.accounts.native_account_info.key;
        pool_info.quote_token_account = *ctx.accounts.quote_token_account.to_account_info().key;
        pool_info.quote_token_mint = ctx.accounts.quote_token_account.mint;

        Ok(())
    }

    pub fn swap(ctx: Context<Swap>, amount_in: u64) -> Result<()> {
        let pool_info = &mut ctx.accounts.pool_info;

        if pool_info.to_account_info().owner != ctx.program_id {
            return Err(ProgramError::IncorrectProgramId.into());
        }

        let authority_id = create_authority_id(
            ctx.program_id,
            pool_info.to_account_info().key,
            pool_info.bump_seed,
        )?;

        if authority_id != *ctx.accounts.swap_authority.key {
            return Err(SwapError::InvalidProgramAddress.into());
        }

        if *ctx.accounts.pool_native_account.key != pool_info.native_account_info {
            return Err(SwapError::InvalidNativeAccount.into());
        }

        if *ctx.accounts.pool_quote_account.to_account_info().key != pool_info.quote_token_account {
            return Err(SwapError::InvalidTokenAccount.into());
        }

        if *ctx.accounts.pool_native_account.to_account_info().key
            == *ctx.accounts.pool_quote_account.to_account_info().key
        {
            return Err(SwapError::InvalidInput.into());
        }

        if *ctx.accounts.token_program.key != pool_info.token_program_id {
            return Err(SwapError::IncorrectTokenProgramId.into());
        }

        let price = pool_info.price;

        let amount_out = amount_in * price;

        let seeds = &[
            &pool_info.to_account_info().key.to_bytes(),
            &[pool_info.bump_seed][..],
        ];

        // Transfer native token from user to pool
        let sol_transfer_ix = solana_program::system_instruction::transfer(
            ctx.accounts.user_wallet.key,
            ctx.accounts.pool_native_account.key,
            amount_in,
        );
        solana_program::program::invoke(&sol_transfer_ix, &[ctx.accounts.user_wallet.clone(), ctx.accounts.pool_native_account.clone(), ctx.accounts.system_program.clone()])?;

        // Transfer quote token from pool to user
        let cpi_transfer_quote_token = Transfer {
            from: ctx.accounts.pool_quote_account.to_account_info().clone(),
            to: ctx.accounts.user_quote_account.to_account_info().clone(),
            authority: ctx.accounts.user_wallet.clone(),
        };
        let cpi_transfer_quote_token_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_transfer_quote_token,
        );
        token::transfer(
            cpi_transfer_quote_token_ctx.with_signer(&[&seeds[..]]),
            amount_out,
        )?;
        Ok(())
    }
}

// Define accounts
#[account]
#[derive(Debug)]
pub struct PoolInfo {
    /// Initialized state
    pub is_initialized: bool,

    /// For each native token swapped receive `price` quote token
    pub price: u64,

    /// Account address hold native token when user deposit to pool
    pub native_account_info: Pubkey,

    /// Token mint address for swap
    pub quote_token_mint: Pubkey,

    /// Token account address for record token mint balance, owned by pool
    pub quote_token_account: Pubkey,

    pub bump_seed: u8,
    pub token_program_id: Pubkey,
}

// Define instructions
#[derive(Accounts)]
pub struct InitPoolSwap<'info> {
    #[account(signer, zero)]
    pub pool_info: Box<Account<'info, PoolInfo>>,

    /// CHECK: doc comment explaining why no checks through types are necessary.
    #[account(mut)]
    pub swap_authority: AccountInfo<'info>,

    #[account(mut)]
    pub quote_token_account: Account<'info, TokenAccount>,

    /// CHECK: doc comment explaining why no checks through types are necessary.
    #[account(mut)]
    pub native_account_info: AccountInfo<'info>,

    /// CHECK: doc comment explaining why no checks through types are necessary.
    pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Swap<'info> {
    pub pool_info: Box<Account<'info, PoolInfo>>,

    /// CHECK: doc comment explaining why no checks through types are necessary.
    pub swap_authority: AccountInfo<'info>,

    /// CHECK: doc comment explaining why no checks through types are necessary.
    #[account(signer)]
    pub user_wallet: AccountInfo<'info>,

    /// CHECK: doc comment explaining why no checks through types are necessary.
    #[account(mut)]
    pub user_quote_account: AccountInfo<'info>,

    /// CHECK: doc comment explaining why no checks through types are necessary.
    #[account(mut)]
    pub pool_native_account: AccountInfo<'info>,

    #[account(mut)]
    pub pool_quote_account: Account<'info, TokenAccount>,

    /// CHECK: doc comment explaining why no checks through types are necessary.
    pub token_program: AccountInfo<'info>,
    
    /// CHECK: doc comment explaining why no checks through types are necessary.
    pub system_program: AccountInfo<'info>,
}

// Helpers function
pub fn create_authority_id(
    program_id: &Pubkey,
    key_info: &Pubkey,
    bump_seed: u8,
) -> Result<Pubkey> {
    Pubkey::create_program_address(&[&key_info.to_bytes()[..32], &[bump_seed]], program_id)
        .or(Err(SwapError::InvalidProgramAddress.into()))
}
