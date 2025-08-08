const { ethers } = require("hardhat");

async function main() {
  // Replace these with actual deployed addresses
  const GOVERNANCE_TOKEN_ADDRESS = process.env.GOVERNANCE_TOKEN_ADDRESS;
  const SOULBOUND_IDENTITY_NFT_ADDRESS = process.env.SOULBOUND_IDENTITY_NFT_ADDRESS;

  if (!GOVERNANCE_TOKEN_ADDRESS || !SOULBOUND_IDENTITY_NFT_ADDRESS) {
    throw new Error("Please set GOVERNANCE_TOKEN_ADDRESS and SOULBOUND_IDENTITY_NFT_ADDRESS in your environment variables.");
  }

  const ConsentraDAOSimple = await ethers.getContractFactory("ConsentraDAOSimple");
  const dao = await ConsentraDAOSimple.deploy(GOVERNANCE_TOKEN_ADDRESS, SOULBOUND_IDENTITY_NFT_ADDRESS);
  await dao.deployed();

  console.log("ConsentraDAOSimple deployed to:", dao.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});