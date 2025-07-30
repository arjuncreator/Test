# ConsentraDAO - AI-Powered Governance with Sybil Resistance

A comprehensive DAO governance system with AI-powered voting, sybil resistance through soulbound identity NFTs, and automated proposal management.

## Features

- **Sybil Resistance**: Soulbound identity NFTs prevent multiple accounts from the same user
- **AI-Powered Voting**: Automated voting based on AI predictions and user preferences
- **Proposal Metadata**: Rich proposal information with tags and AI confidence scores
- **Timelock Governance**: Secure execution with configurable delays
- **Factory Pattern**: Easy DAO creation with automated setup

## Issues Fixed

The main issues preventing DAO creation were:

1. **Missing OpenZeppelin Dependencies**: The project needed proper dependency management
2. **Constructor Parameter Mismatch**: DAO contracts required specific initialization parameters
3. **Role Assignment Issues**: Access control wasn't properly configured between contracts
4. **Clone Pattern Limitations**: Using clones with constructor parameters caused initialization problems

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Compile Contracts

```bash
npx hardhat compile
```

### 3. Deploy Contracts

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Test DAO Creation

```bash
npx hardhat run scripts/test-dao-creation.js --network localhost
```

## Contract Architecture

### Core Contracts

- **ConsentraDAO**: Main governance contract with voting and proposal management
- **ConsentraGovernanceToken**: ERC20 token with voting capabilities
- **SoulboundIdentityNFT**: Non-transferable NFT for identity verification
- **DAOFactory**: Factory contract for creating new DAOs

### Supporting Modules

- **AIVotingModule**: Handles AI-powered voting functionality
- **ProposalMetadataModule**: Stores rich proposal metadata
- **AIOracle**: Provides AI predictions and analysis
- **TimelockController**: Manages proposal execution delays

## DAO Creation Process

1. **Identity Verification**: Users must have a verified soulbound identity NFT
2. **Factory Deployment**: Deploy the DAOFactory with all required dependencies
3. **DAO Configuration**: Define DAO parameters (voting periods, quorum, etc.)
4. **Token Distribution**: Set initial token allocations for founding members
5. **Role Setup**: Configure access control and permissions

## Troubleshooting

### Common Issues

1. **"Creator must be verified" Error**
   - Ensure the creator has a soulbound identity NFT
   - Check that the NFT is verified using `identityNFT.isVerified(address)`

2. **"Arrays length mismatch" Error**
   - Make sure `initialMembers` and `initialAllocations` arrays have the same length

3. **"All members must be verified" Error**
   - All initial members must have verified identity NFTs
   - Use `identityNFT.mintIdentity()` to create verified identities

4. **Role Permission Errors**
   - Ensure the factory has proper permissions on supporting contracts
   - Check that the DAO has admin role on the metadata module

### Verification Steps

1. Check identity verification:
```javascript
const isVerified = await identityNFT.isVerified(userAddress);
```

2. Verify token ownership:
```javascript
const balance = await token.balanceOf(userAddress);
```

3. Check DAO membership:
```javascript
const isMember = await daoFactory.checkMembership(userAddress, daoId);
```

## Development

### Adding New Features

1. **New Voting Mechanisms**: Extend the `AIVotingModule`
2. **Additional Metadata**: Enhance `ProposalMetadataModule`
3. **Custom Governance**: Modify `ConsentraDAO` for specific requirements

### Testing

```bash
npx hardhat test
```

### Local Development

```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

## Security Considerations

- All users must have verified identities to participate
- AI predictions are provided by authorized oracles only
- Timelock delays prevent immediate execution of proposals
- Access control is enforced at multiple levels

## License

MIT License - see LICENSE file for details 