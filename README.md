# Voting App

Decentralized election platform that combines Ethereum smart contracts with a React/Vite front end. The system lets administrators create and manage elections while end users vote securely through MetaMask on the Hardhat local blockchain.

## Features
- Role-based access control: on-chain admin list stored in `Auth.sol`
- Election lifecycle: create, update, vote, tally, and publish immutable results
- MetaMask integration with automatic account/network detection
- User-friendly dashboard built with React 19 + Material UI
- Live election state, countdown timers, and published-result views

## Architecture
- **Smart contracts (Hardhat / Solidity 0.8.28):** `Auth` manages admin roles; `ElectionManager` stores elections, tracks votes, computes outcomes, and persists final tallies.
- **Frontend (React + Vite + Ethers v6):** `AuthProvider` wraps the app, syncing wallet state and exposing admin actions. Feature modules cover login, election browsing, admin tools, and result publication.
- **Tooling:** Hardhat Toolbox, dotenv for secrets, pnpm for dependency management, Material UI theming.

### Project Structure
```
contracts/                 # Solidity sources
artifacts/                 # Generated ABIs after Hardhat compile/deploy
scripts/deploy.js          # Deploys Auth + ElectionManager in sequence
frontend/vite-project/     # React application (pnpm, Vite, MUI)
  src/
    contexts/AuthProvider   # Wallet + admin state management
    features/
      user-auth             # Login flow & wallet utilities
      election              # Election listing, cards, services
      admin-management      # Create elections & publish results
```

## Prerequisites
- Node.js 18+ (recommended) with pnpm installed globally (`npm install -g pnpm`)
- MetaMask browser extension configured for the Hardhat local chain (chain id `31337`)
- Optional: Hardhat-compatible private key in `.env` for scripted deployments

## Setup & Installation
1. Install backend dependencies (from repo root):
   ```bash
   pnpm install
   ```
2. Install frontend dependencies:
   ```bash
   cd frontend/vite-project
   pnpm install
   ```

## Environment Configuration
1. **Root `.env`** (used by Hardhat):
   ```ini
   PRIVATE_KEY=0xabc123...    # account used for deployments, funded on localhost
   ```
2. **Frontend `.env.local`** (inside `frontend/vite-project/`):
   ```ini
   VITE_CONTRACT_ADDRESS=0xAuthContractAddress
   VITE_ELECTION_MANAGER_ADDRESS=0xElectionManagerAddress
   ```
   These addresses come from the deployment step below.

## Local Development Workflow
1. **Start a local Hardhat network**
   ```bash
   npx hardhat node
   ```
2. **Deploy contracts to localhost**
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
   Copy the printed `Auth` and `ElectionManager` addresses into your frontend environment file.
3. **Run the React app**
   ```bash
   cd frontend/vite-project
   pnpm dev
   ```
   Visit `http://localhost:5173` and connect MetaMask to the Hardhat chain.

## Using the App
- **Login:** visit `/login`, connect MetaMask; non-admins land on the election page, admins are routed to `/admin`.
- **Admin tools:** create elections, review expired contests, fetch tallies (`getElectionResults`), and publish immutable results on-chain.
- **User experience:** view upcoming/live elections with countdown timers and cast a single vote per election; published view shows final tallies and winners.

## Testing & Linting
- Compile contracts: `npx hardhat compile`
- (Add tests under `test/` and run) `npx hardhat test`
- Lint frontend: `pnpm lint` inside `frontend/vite-project`

## Next Steps
- Implement the pending "Manage Admin" UI to call `addAdminAddress`/`removeAdminAddress`
- Extend contract test coverage before mainnet or testnet deployment
- Consider persisting published artifacts/ABIs inside the frontend tree to avoid absolute import paths
