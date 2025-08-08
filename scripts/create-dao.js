const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Creating DAO with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance));

  try {
    // Get the deployed DAOFactorySimple contract
    const daoFactoryAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; // Local network address
    const DAOFactorySimple = await ethers.getContractFactory("DAOFactorySimple");
    const daoFactory = DAOFactorySimple.attach(daoFactoryAddress);
    
    console.log("✅ Connected to DAOFactorySimple at:", daoFactoryAddress);

    // DAO creation parameters (matching the actual function signature)
    const daoName = "Test DAO";
    const tokenSymbol = "TEST";
    const initialSupply = ethers.parseEther("1000000"); // 1 million tokens
    const initialMembers = [deployer.address]; // Start with deployer as member

    console.log("\n📋 DAO Creation Parameters:");
    console.log("DAO Name:", daoName);
    console.log("Token Symbol:", tokenSymbol);
    console.log("Initial Supply:", ethers.formatEther(initialSupply));
    console.log("Initial Members:", initialMembers);

    // Create the DAO
    console.log("\n🚀 Creating DAO...");
    const createDAOTx = await daoFactory.createDAO(
      daoName,
      tokenSymbol,
      initialSupply,
      initialMembers
    );

    console.log("Transaction hash:", createDAOTx.hash);
    console.log("Waiting for transaction confirmation...");
    
    const receipt = await createDAOTx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

    // Get the created DAO address from the event
    const daoCreatedEvent = receipt.logs.find(log => {
      try {
        const parsed = daoFactory.interface.parseLog(log);
        return parsed.name === "DAOCreated";
      } catch {
        return false;
      }
    });

    if (daoCreatedEvent) {
      const parsedEvent = daoFactory.interface.parseLog(daoCreatedEvent);
      const daoAddress = parsedEvent.args.daoAddress;
      const creator = parsedEvent.args.creator;
      const name = parsedEvent.args.name;
      
      console.log("\n🎉 DAO Created Successfully!");
      console.log("DAO Address:", daoAddress);
      console.log("Creator:", creator);
      console.log("Name:", name);
      
      // Check if the DAO is registered
      const isDAO = await daoFactory.isDAO(daoAddress);
      console.log("Is Registered DAO:", isDAO);
      
      // Get deployed DAOs count
      const daoCount = await daoFactory.getDAOCount();
      console.log("Total DAOs Created:", daoCount.toString());
      
      // Get all deployed DAOs
      const deployedDAOs = await daoFactory.getDeployedDAOs();
      console.log("All Deployed DAOs:", deployedDAOs);
      
      // Try to get DAO info (if the DAO contract has the function)
      try {
        const ConsentraDAOSimple = await ethers.getContractFactory("ConsentraDAOSimple");
        const dao = ConsentraDAOSimple.attach(daoAddress);
        
        // Try to get some basic info
        const votingDelay = await dao.votingDelay();
        const votingPeriod = await dao.votingPeriod();
        const proposalThreshold = await dao.proposalThreshold();
        const quorum = await dao.quorum(await ethers.provider.getBlockNumber());
        
        console.log("\n📊 DAO Governance Parameters:");
        console.log("Voting Delay:", votingDelay.toString() + " blocks");
        console.log("Voting Period:", votingPeriod.toString() + " blocks");
        console.log("Proposal Threshold:", proposalThreshold.toString());
        console.log("Quorum:", quorum.toString());
        
      } catch (error) {
        console.log("\n⚠️ Could not get detailed DAO info:", error.message);
      }
      
    } else {
      console.log("❌ Could not find DAOCreated event in transaction receipt");
    }

    console.log("\n💰 Remaining balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  } catch (error) {
    console.error("❌ DAO creation failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
