const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy ConsentraGovernanceToken
  console.log("Deploying ConsentraGovernanceToken...");
  const ConsentraGovernanceToken = await ethers.getContractFactory("ConsentraGovernanceToken");
  const governanceToken = await ConsentraGovernanceToken.deploy(deployer.address);
  await governanceToken.waitForDeployment();
  console.log("ConsentraGovernanceToken deployed to:", await governanceToken.getAddress());

  // Deploy SoulboundIdentityNFT
  console.log("Deploying SoulboundIdentityNFT...");
  const SoulboundIdentityNFT = await ethers.getContractFactory("SoulboundIdentityNFT");
  const identityNFT = await SoulboundIdentityNFT.deploy();
  await identityNFT.waitForDeployment();
  console.log("SoulboundIdentityNFT deployed to:", await identityNFT.getAddress());

  // Deploy ConsentraDAOSimple
  console.log("Deploying ConsentraDAOSimple...");
  const ConsentraDAOSimple = await ethers.getContractFactory("ConsentraDAOSimple");
  const dao = await ConsentraDAOSimple.deploy(await governanceToken.getAddress(), await identityNFT.getAddress());
  await dao.waitForDeployment();
  console.log("ConsentraDAOSimple deployed to:", await dao.getAddress());

  console.log("\n=== Deployment Summary ===");
  console.log("Governance Token:", await governanceToken.getAddress());
  console.log("Identity NFT:", await identityNFT.getAddress());
  console.log("DAO Contract:", await dao.getAddress());
  console.log("Deployer:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 