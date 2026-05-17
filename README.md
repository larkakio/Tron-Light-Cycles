# Tron Light Cycles

Mobile-first neon light-cycle arena on **Base**. Swipe to turn, trap rivals, clear sectors, and optionally sync a daily on-chain check-in.

## Stack

- **web/** — Next.js (App Router), TypeScript, Tailwind, Canvas game
- **contracts/** — Foundry `CheckIn.sol` (daily check-in, streak, no `msg.value`)
- **wagmi + viem + ox** — wallet, Base mainnet, ERC-8021 Builder Code attribution

## Quick start

```bash
cd web && npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Contracts

```bash
cd contracts
forge test
# Deploy (set DEPLOYER_PRIVATE_KEY + BASE_RPC_URL)
forge script script/Deploy.s.sol --rpc-url $BASE_RPC_URL --broadcast
```

Base mainnet `CheckIn`: `0x15cBa4fcd455e7389Fa04D80cd4d84016A0DCeA3` (set in `web/.env.local`).

## Environment

Copy `.env.example` to `web/.env.local` and fill in:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_BASE_APP_ID` | From [base.dev](https://base.dev) project settings |
| `NEXT_PUBLIC_BUILDER_CODE` | `bc_…` from base.dev → Settings → Builder Code |
| `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS` | Deployed `CheckIn` on Base mainnet |
| `NEXT_PUBLIC_CHAIN_ID` | `8453` (Base mainnet) |

## Controls

- **Swipe left / right** — turn 90°
- **Swipe up** — brief speed boost
- Beat all enemies to unlock the next sector

## Base App

- Standard web app (no Farcaster SDK)
- `<meta name="base:app_id" />` in root layout
- Builder Code via `dataSuffix` on wagmi config ([docs](https://docs.base.org/apps/builder-codes/app-developers))
- Wallet connect sheet rendered via `createPortal` to `document.body`

## Deploy (Vercel)

- Root Directory: `web`
- Set all `NEXT_PUBLIC_*` env vars in the project

## Assets

- `web/public/app-icon.jpg` — 1024×1024, &lt;1MB
- `web/public/app-thumbnail.jpg` — 1200×628 (1.91:1), &lt;1MB

Regenerate with `scripts/optimize-images.sh` after updating source PNGs.
