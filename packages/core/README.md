# Hakata Perpetuals - Core

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](../../LICENSE)

The on-chain implementation of Hakata Finance's perpetual trading protocol on Solana.

## Overview

Hakata Perpetuals Core is the backbone of our protocol - a non-custodial decentralized exchange that supports leveraged trading of real-world assets on Solana. It provides the foundation for secure, efficient, and transparent on-chain perpetual futures trading.

## Features

- Non-custodial architecture ensuring asset security
- Leveraged trading with configurable positions
- Asset pools with customizable parameters
- Fully on-chain settlement and liquidation mechanics
- Oracle integration for reliable price data
- Risk management systems to maintain protocol stability

## Tech Stack

- [Solana](https://solana.com/) - High-performance blockchain
- [Anchor](https://www.anchor-lang.com/) - Framework for Solana program development
- [Rust](https://www.rust-lang.org/) - Systems programming language
- [Pyth](https://pyth.network/) - Oracle for real-time price data

## Project Structure

```text
packages/core/
├─ programs/              # Solana programs (smart contracts)
│  └─ perpetuals/         # Main perpetuals protocol program
│     ├─ src/             # Source code for the program
│     └─ Cargo.toml       # Rust dependencies
├─ app/                   # CLI and administration tools
│  └─ src/                # TypeScript source for CLI
├─ tests/                 # Integration and unit tests
│  ├─ ts/                 # TypeScript tests
│  └─ rust/               # Rust tests
├─ Anchor.toml            # Anchor configuration
└─ Cargo.toml             # Workspace configuration
```

## Getting Started

### Prerequisites

- [Solana CLI tools](https://docs.solana.com/cli/install-solana-cli-tools) (v2.1.0 or later)
- [Rust](https://rustup.rs/) (latest stable version)
- [Anchor Framework](https://www.anchor-lang.com/docs/installation) (v0.31.1 or later)
- [Node.js](https://nodejs.org/) (v18 or later)

### Installation

```bash
# Clone the repository if you haven't already
git clone https://github.com/hakata-finance/hakata-perps.git
cd hakata-perps/packages/core

# Install dependencies
npm install
```

### Building

```bash
# Build the program
anchor build
```

### Testing

```bash
# Run Rust unit tests
cargo test -- --nocapture

# Run integration tests (Typescript)
anchor test

# Run integration tests (Rust)
cargo test-bpf -- --nocapture
```

## Deployment

### Devnet Deployment

```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# Upload IDL
anchor idl init --provider.cluster devnet --filepath ./target/idl/perpetuals.json <PROGRAM_ID>
```

### Mainnet Deployment

For mainnet deployments, we recommend using a multi-signature authority:

```bash
# Deploy to mainnet
anchor deploy --provider.cluster mainnet-beta

# Set up authority with multi-sig
npx ts-node app/src/cli.ts -k <ADMIN_WALLET> init --min-signatures <NUM> <ADMIN_WALLET1> <ADMIN_WALLET2> ...
```

## Protocol Administration

The protocol can be administrated using the CLI tool:

```bash
# Add a new trading pool
npx ts-node app/src/cli.ts -k <ADMIN_WALLET> add-pool <POOL_NAME>

# Add a token custody to a pool
npx ts-node app/src/cli.ts -k <ADMIN_WALLET> add-custody <POOL_NAME> <TOKEN_MINT> <TOKEN_ORACLE> -s <IS_STABLE>

# View pools
npx ts-node app/src/cli.ts -k <ADMIN_WALLET> get-pools

# View custodies in a pool
npx ts-node app/src/cli.ts -k <ADMIN_WALLET> get-custodies <POOL_NAME>
```

## Security Considerations

- All protocol upgrades should be carefully reviewed and tested
- For mainnet deployments, use multi-signature authorities
- Regular security audits are recommended
- If you discover a security vulnerability, please report it privately to <admin@hakata.fi>

## Contributing

We welcome contributions to improve the protocol:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Implement amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
