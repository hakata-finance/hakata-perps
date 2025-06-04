# Architecture Decision: Building on solana-labs/perpetuals

## Foundation

Built on [solana-labs/perpetuals](https://github.com/solana-labs/perpetuals) - Solana Labs' official reference implementation for perpetual futures trading on Solana.

**License:** Apache 2.0 (compatible with our project)

## Strategic Rationale

### Why Build on Existing Infrastructure

1. **Battle-Tested Foundation**
   - Extensive testing by Solana Labs core team
   - Production-ready perpetual mechanics
   - Proven handling of complex edge cases

2. **Security-First Approach**
   - Reduces attack surface vs. custom implementation
   - Benefits from ongoing Solana Labs security reviews
   - Leverages ecosystem-wide security best practices

3. **Development Efficiency**
   - Focus 5-week hackathon sprint on RWA innovations
   - Avoid rebuilding complex perpetual infrastructure
   - Faster time-to-market for unique features

4. **Ecosystem Alignment**
   - Built on Solana's recommended patterns
   - Compatible with existing tooling and infrastructure
   - Natural integration with Solana ecosystem protocols

## Core Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Hakata Finance                       │
│                   (RWA Extensions)                      │
├─────────────────────────────────────────────────────────┤
│  • Custom Oracle Integration (Pyth + TradFi sources)   │
│  • Market Hours Logic                                  │
│  • Synthetic Asset Mechanisms                          │
│  • Enhanced Risk Management                            │
├─────────────────────────────────────────────────────────┤
│                 solana-labs/perpetuals                  │
│                  (Foundation Layer)                     │
├─────────────────────────────────────────────────────────┤
│  • Core Perpetual Mechanics                           │
│  • Position Management                                │
│  • Liquidation Logic                                  │
│  • Funding Rate Calculations                          │
│  • Margin Requirements                                │
└─────────────────────────────────────────────────────────┘
```

## Key Extensions & Modifications

### 1. Oracle Integration
- **Base:** Generic oracle interface from solana-labs/perpetuals
- **Extension:** Multi-oracle architecture supporting:
  - Pyth Network for crypto assets
  - Custom TradFi data feeds for stocks/forex
  - Market hours validation logic
  - Price gap handling for after-hours trading

### 2. Asset Type Handling
- **Base:** Crypto asset assumptions
- **Extension:** RWA-specific logic:
  - Trading hour restrictions
  - Market close position management

### 3. Risk Management
- **Base:** Standard perpetual risk parameters
- **Extension:** TradFi-optimized risk models:
  - Asset-class specific margin requirements
  - Volatility adjustments for traditional markets
  - Cross-asset correlation risk modeling

## File Structure Mapping

### Inherited from solana-labs/perpetuals

```text
programs/hakata-perpetuals/src/
├── lib.rs              # Core program entry (modified)
├── instructions/       # Trading instructions (extended)
├── state/             # Account structures (extended)
├── math.rs            # Mathematical operations (inherited)
└── error.rs           # Error definitions (extended)
```

### Hakata-Specific Extensions

```text
programs/hakata-perpetuals/src/
├── oracle/            # Multi-oracle integration (new)
├── rwa/              # RWA-specific logic (new)
└── market_hours/     # Trading hours management (new)
```

## Integration Points

### 1. Instruction Extensions
- Inherit: open_position, close_position, liquidate
- Extend: Add RWA validation and market hours checks
- New: RWA-specific position management instructions

### 2. State Extensions
- Inherit: Position, Custody, Pool structures
- Extend: Add RWA metadata fields
- New: Market hours configuration accounts

### 3. Oracle Interface
- Inherit: Base oracle trait definitions
- Extend: Multi-source oracle aggregation
- New: TradFi data source integrations

## Development Workflow

### 1. Base Updates
- Monitor solana-labs/perpetuals for security updates
- Selective integration of non-breaking improvements
- Maintain compatibility with RWA extensions

### 2. Extension Development
- Build RWA features as modular extensions
- Maintain clear separation from base functionality
- Comprehensive testing of interaction points

### 3. Security Considerations
- Regular security reviews of extension code
- Leverage base security audits where possible
- Additional audits for RWA-specific logic

### Contribution Strategy
- Keep RWA-specific extensions as proprietary differentiation
- Maintain good standing in Solana developer ecosystem

## Compliance & Licensing

- Base License: Apache 2.0 (solana-labs/perpetuals)
- Our License: Apache 2.0 (compatible)
- Attribution: Maintained in all relevant documentation
- Contributions: Follow Solana Labs contribution guidelines for base improvements

This architecture decision enables Hakata Finance to deliver production-ready RWA perpetual trading while leveraging the most robust perpetual infrastructure available on Solana.