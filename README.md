# Hakata Finance - Perpetuals Protocol

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

Monorepo for Hakata Finance's open‑source perpetual‑trading protocol on Solana.

## Overview

Hakata Perpetuals is Core Perpetual Futures Engine for Real-World Asset Trading on Solana

## Deployment Addresses

Hakata Finance is deployed on Solana Devnet.

The following programs are deployed:

| Program                | Address                                      |
|------------------------|----------------------------------------------|
| Registry               | CkawHJw5TVjUt1ggAZtuo3hgHBMptJHtxXk6A6nY5RWg |

## Repository Structure

```text
hakata-perps/
├─ packages/
│  ├─ core/        # Anchor program(s) and on-chain Solana code
│  │  └─ README.md # Details about core implementation
│  └─ ui/          # Next.js front-end application
│     └─ README.md # UI development documentation
└─ README.md       # This file
```

## Getting Started

### Prerequisites

- [Solana CLI tools](https://docs.solana.com/cli/install-solana-cli-tools)
- [Rust](https://rustup.rs/) (latest stable version)
- [Anchor Framework](https://www.anchor-lang.com/docs/installation)
- [Node.js](https://nodejs.org/) (for UI development)

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/hakata-finance/hakata-perps
   cd hakata-perps
   ```

2. Install dependencies

   ```bash
   # For core development
   cd packages/core
   npm install
   
   # For UI development
   cd packages/ui
   npm install
   ```

3. See the individual READMEs in each package for specific setup instructions:
   - [Core README](packages/core/README.md)
   - [UI README](packages/ui/README.md)

## Development

### Running the UI locally

```bash
cd packages/ui
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing the core

```bash
cd packages/core
npm test
```

## Contributing

We welcome contributions to Hakata Finance's perpetual trading protocol!

1. Fork the repository and create a feature branch
2. Keep PRs focused on a single issue or feature
3. Include tests for any new functionality
4. Ensure your code adheres to the project's style guidelines
5. Submit a pull request with a clear description of the changes

For major changes or architectural decisions, please open an issue first to discuss.

## License

This project is licensed under the [Apache License 2.0](LICENSE).

## Security

If you discover a security vulnerability in this project, please report it privately to <admin@hakata.fi> instead of opening a public issue.
