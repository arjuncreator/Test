const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy SoulboundIdentityNFT first
  const SoulboundIdentityNFT = await ethers.getContractFactory("SoulboundIdentityNFT");
  const identityNFT = await SoulboundIdentityNFT.deploy();
  await identityNFT.waitForDeployment();
  console.log("SoulboundIdentityNFT deployed to:", await identityNFT.getAddress());

  // Deploy AIOracle
  const AIOracle = await ethers.getContractFactory("AIOracle");
  const aiOracle = await AIOracle.deploy();
  await aiOracle.waitForDeployment();
  console.log("AIOracle deployed to:", await aiOracle.getAddress());

  // Deploy AIVotingModule
  const AIVotingModule = await ethers.getContractFactory("AIVotingModule");
  const aiVotingModule = await AIVotingModule.deploy(await identityNFT.getAddress(), await aiOracle.getAddress());
  await aiVotingModule.waitForDeployment();
  console.log("AIVotingModule deployed to:", await aiVotingModule.getAddress());

  // Deploy ProposalMetadataModule
  const ProposalMetadataModule = await ethers.getContractFactory("ProposalMetadataModule");
  const proposalMetadataModule = await ProposalMetadataModule.deploy();
  await proposalMetadataModule.waitForDeployment();
  console.log("ProposalMetadataModule deployed to:", await proposalMetadataModule.getAddress());

  // Deploy ConsentraGovernanceToken implementation
  const ConsentraGovernanceToken = await ethers.getContractFactory("ConsentraGovernanceToken");
  const tokenImplementation = await ConsentraGovernanceToken.deploy(deployer.address);
  await tokenImplementation.waitForDeployment();
  console.log("Token implementation deployed to:", await tokenImplementation.getAddress());

  // Deploy ConsentraDAO implementation
  const ConsentraDAO = await ethers.getContractFactory("ConsentraDAO");
  const daoImplementation = await ConsentraDAO.deploy(
    await tokenImplementation.getAddress(),
    ethers.ZeroAddress, // Placeholder timelock
    await identityNFT.getAddress(),
    await aiVotingModule.getAddress(),
    await proposalMetadataModule.getAddress()
  );
  await daoImplementation.waitForDeployment();
  console.log("DAO implementation deployed to:", await daoImplementation.getAddress());

  // Deploy DAOFactory
  const DAOFactory = await ethers.getContractFactory("DAOFactory");
  const daoFactory = await DAOFactory.deploy(
    await daoImplementation.getAddress(),
    await tokenImplementation.getAddress(),
    await identityNFT.getAddress(),
    await aiOracle.getAddress()
  );
  await daoFactory.waitForDeployment();
  console.log("DAOFactory deployed to:", await daoFactory.getAddress());

  // Grant factory permission to mint tokens
  await tokenImplementation.transferOwnership(await daoFactory.getAddress());
  console.log("Token ownership transferred to factory");

  // Grant factory admin role on metadata module
  await proposalMetadataModule.grantRole(await proposalMetadataModule.DEFAULT_ADMIN_ROLE(), await daoFactory.getAddress());
  console.log("Factory granted admin role on metadata module");

  console.log("Deployment completed successfully!");
  console.log("\nContract Addresses:");
  console.log("SoulboundIdentityNFT:", await identityNFT.getAddress());
  console.log("AIOracle:", await aiOracle.getAddress());
  console.log("AIVotingModule:", await aiVotingModule.getAddress());
  console.log("ProposalMetadataModule:", await proposalMetadataModule.getAddress());
  console.log("Token Implementation:", await tokenImplementation.getAddress());
  console.log("DAO Implementation:", await daoImplementation.getAddress());
  console.log("DAOFactory:", await daoFactory.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 