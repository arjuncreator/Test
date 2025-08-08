const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Testing DAO interactions with account:", deployer.address);

  try {
    // Test local network DAO
    console.log("\n=== Testing Local Network DAO ===");
    const localDAOAddress = "0x856e4424f806D16E8CBC702B3c0F2ede5468eae5";
    const ConsentraDAOSimple = await ethers.getContractFactory("ConsentraDAOSimple");
    const localDAO = ConsentraDAOSimple.attach(localDAOAddress);
    
    console.log("Local DAO Address:", localDAOAddress);
    
    // Test basic functions
    const votingDelay = await localDAO.votingDelay();
    const votingPeriod = await localDAO.votingPeriod();
    const proposalThreshold = await localDAO.proposalThreshold();
    const quorum = await localDAO.quorum(await ethers.provider.getBlockNumber());
    
    console.log("✅ Local DAO Governance Parameters:");
    console.log("  Voting Delay:", votingDelay.toString() + " blocks");
    console.log("  Voting Period:", votingPeriod.toString() + " blocks");
    console.log("  Proposal Threshold:", proposalThreshold.toString());
    console.log("  Quorum:", quorum.toString());
    
    // Test Sepolia network DAO
    console.log("\n=== Testing Sepolia Network DAO ===");
    const sepoliaDAOAddress = "0xeAa9ece43cfF513fb8cA530453C4b085DBa163b6";
    const sepoliaDAO = ConsentraDAOSimple.attach(sepoliaDAOAddress);
    
    console.log("Sepolia DAO Address:", sepoliaDAOAddress);
    
    // Test basic functions
    const sepoliaVotingDelay = await sepoliaDAO.votingDelay();
    const sepoliaVotingPeriod = await sepoliaDAO.votingPeriod();
    const sepoliaProposalThreshold = await sepoliaDAO.proposalThreshold();
    const sepoliaQuorum = await sepoliaDAO.quorum(await ethers.provider.getBlockNumber());
    
    console.log("✅ Sepolia DAO Governance Parameters:");
    console.log("  Voting Delay:", sepoliaVotingDelay.toString() + " blocks");
    console.log("  Voting Period:", sepoliaVotingPeriod.toString() + " blocks");
    console.log("  Proposal Threshold:", sepoliaProposalThreshold.toString());
    console.log("  Quorum:", sepoliaQuorum.toString());
    
    // Test factory contract
    console.log("\n=== Testing Factory Contracts ===");
    
    // Local factory
    const localFactoryAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
    const DAOFactorySimple = await ethers.getContractFactory("DAOFactorySimple");
    const localFactory = DAOFactorySimple.attach(localFactoryAddress);
    
    const localDAOCount = await localFactory.getDAOCount();
    const localDeployedDAOs = await localFactory.getDeployedDAOs();
    const localIsDAO = await localFactory.isDAO(localDAOAddress);
    
    console.log("✅ Local Factory Status:");
    console.log("  Total DAOs Created:", localDAOCount.toString());
    console.log("  Deployed DAOs:", localDeployedDAOs);
    console.log("  Is Registered DAO:", localIsDAO);
    
    // Sepolia factory
    const sepoliaFactoryAddress = "0xB5bD8645bA6614aF4782F0212155dD33F8e66269";
    const sepoliaFactory = DAOFactorySimple.attach(sepoliaFactoryAddress);
    
    const sepoliaDAOCount = await sepoliaFactory.getDAOCount();
    const sepoliaDeployedDAOs = await sepoliaFactory.getDeployedDAOs();
    const sepoliaIsDAO = await sepoliaFactory.isDAO(sepoliaDAOAddress);
    
    console.log("✅ Sepolia Factory Status:");
    console.log("  Total DAOs Created:", sepoliaDAOCount.toString());
    console.log("  Deployed DAOs:", sepoliaDeployedDAOs);
    console.log("  Is Registered DAO:", sepoliaIsDAO);
    
    console.log("\n🎉 All DAO interactions tested successfully!");
    
  } catch (error) {
    console.error("❌ DAO interaction test failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
