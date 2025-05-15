# Hakata Perpetuals - UI

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](../../LICENSE)

The front-end interface for Hakata Finance's perpetual trading protocol on Solana.

## Overview

This UI provides traders with a seamless interface to interact with the Hakata Perpetuals protocol. Built with Next.js and modern web technologies, it offers a responsive and intuitive trading experience.

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Solana Web3.js](https://github.com/solana-labs/solana-web3.js) - Solana JavaScript API
- [Geist Font](https://vercel.com/font) - Modern typeface by Vercel

## Project Structure

```text
packages/ui/
├─ src/                 # Source code
│  ├─ app/              # Next.js App Router structure
│  │  ├─ api/           # API routes
│  │  ├─ trade/         # Trading pages
│  │  ├─ vault/         # Vault pages
│  │  ├─ leaderboard/   # Leaderboard pages
│  │  ├─ faucet/        # Faucet page
│  │  ├─ page.tsx       # Homepage
│  │  ├─ layout.tsx     # Root layout component
│  │  └─ globals.css    # Global styles
│  ├─ components/       # Shared UI components
│  ├─ hooks/            # Custom React hooks
│  ├─ lib/              # Library code and API wrappers
│  ├─ actions/          # Server actions
│  ├─ stores/           # State management
│  └─ context/          # React context providers
├─ public/              # Static assets
├─ tailwind.config.ts   # Tailwind configuration
├─ next.config.ts       # Next.js configuration
└─ package.json         # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
# Start development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
# Build the application
npm run build
# or
yarn build
# or
pnpm build

# Start production server
npm run start
# or
yarn start
# or
pnpm start
```

## Configuration

The UI can be configured to connect to different environments:

- Local development (default)
- Devnet
- Mainnet

Environment variables can be set in `.env.local` file:

```text
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_ENDPOINT=https://your-rpc-endpoint.com
```

## Contributing

We welcome contributions to improve the UI:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features
- [Hakata Perpetuals Documentation](https://docs.hakata.fi) - Learn about the protocol
