const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying to testnet with account:", deployer.address);
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance));

  // Check if we have enough balance
  if (balance < ethers.parseEther("0.09")) {
    throw new Error("Insufficient balance for deployment. Need at least 0.09 ETH");
  }

  try {
    // 1. Deploy SoulboundIdentityNFT
    console.log("\n1. Deploying SoulboundIdentityNFT...");
    const SoulboundIdentityNFT = await ethers.getContractFactory("SoulboundIdentityNFT");
    const identityNFT = await SoulboundIdentityNFT.deploy();
    await identityNFT.waitForDeployment();
    console.log("✅ SoulboundIdentityNFT deployed to:", await identityNFT.getAddress());

    // 2. Deploy AIOracle
    console.log("\n2. Deploying AIOracle...");
    const AIOracle = await ethers.getContractFactory("AIOracle");
    const aiOracle = await AIOracle.deploy();
    await aiOracle.waitForDeployment();
    console.log("✅ AIOracle deployed to:", await aiOracle.getAddress());

    // 3. Deploy AIVotingModule
    console.log("\n3. Deploying AIVotingModule...");
    const AIVotingModule = await ethers.getContractFactory("AIVotingModule");
    const aiVotingModule = await AIVotingModule.deploy(
      await identityNFT.getAddress(), 
      await aiOracle.getAddress()
    );
    await aiVotingModule.waitForDeployment();
    console.log("✅ AIVotingModule deployed to:", await aiVotingModule.getAddress());

    // 4. Deploy ProposalMetadataModule
    console.log("\n4. Deploying ProposalMetadataModule...");
    const ProposalMetadataModule = await ethers.getContractFactory("ProposalMetadataModule");
    const proposalMetadataModule = await ProposalMetadataModule.deploy();
    await proposalMetadataModule.waitForDeployment();
    console.log("✅ ProposalMetadataModule deployed to:", await proposalMetadataModule.getAddress());

    // 5. Deploy ConsentraGovernanceToken implementation
    console.log("\n5. Deploying ConsentraGovernanceToken...");
    const ConsentraGovernanceToken = await ethers.getContractFactory("ConsentraGovernanceToken");
    const tokenImplementation = await ConsentraGovernanceToken.deploy(deployer.address);
    await tokenImplementation.waitForDeployment();
    console.log("✅ Token implementation deployed to:", await tokenImplementation.getAddress());

    // 6. Deploy ConsentraDAO implementation
    console.log("\n6. Deploying ConsentraDAO...");
    const ConsentraDAO = await ethers.getContractFactory("ConsentraDAO");
    const daoImplementation = await ConsentraDAO.deploy(
      await tokenImplementation.getAddress(),
      ethers.ZeroAddress, // Placeholder timelock
      await identityNFT.getAddress(),
      await aiVotingModule.getAddress(),
      await proposalMetadataModule.getAddress()
    );
    await daoImplementation.waitForDeployment();
    console.log("✅ DAO implementation deployed to:", await daoImplementation.getAddress());

    // 7. Deploy DAOFactory
    console.log("\n7. Deploying DAOFactory...");
    const DAOFactory = await ethers.getContractFactory("DAOFactory");
    const daoFactory = await DAOFactory.deploy(
      await daoImplementation.getAddress(),
      await tokenImplementation.getAddress(),
      await identityNFT.getAddress(),
      await aiOracle.getAddress()
    );
    await daoFactory.waitForDeployment();
    console.log("✅ DAOFactory deployed to:", await daoFactory.getAddress());

    // 8. Setup permissions
    console.log("\n8. Setting up permissions...");
    await tokenImplementation.transferOwnership(await daoFactory.getAddress());
    await proposalMetadataModule.grantRole(
      await proposalMetadataModule.DEFAULT_ADMIN_ROLE(), 
      await daoFactory.getAddress()
    );
    console.log("✅ Permissions configured");

    // 9. Mint test identities
    console.log("\n9. Minting test identities...");
    await identityNFT.mintIdentity(
      deployer.address, 
      ethers.keccak256(ethers.toUtf8Bytes("deployer")), 
      "ipfs://deployer"
    );
    console.log("✅ Test identity minted for deployer");

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log("SoulboundIdentityNFT:", await identityNFT.getAddress());
    console.log("AIOracle:", await aiOracle.getAddress());
    console.log("AIVotingModule:", await aiVotingModule.getAddress());
    console.log("ProposalMetadataModule:", await proposalMetadataModule.getAddress());
    console.log("Token Implementation:", await tokenImplementation.getAddress());
    console.log("DAO Implementation:", await daoImplementation.getAddress());
    console.log("DAOFactory:", await daoFactory.getAddress());

    console.log("\n💰 Remaining balance:", ethers.formatEther(await deployer.getBalance()));

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 