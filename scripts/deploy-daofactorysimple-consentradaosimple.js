const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying DAOFactorySimple and ConsentraDAOSimple contracts with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance));

  if (balance < ethers.parseEther("0.05")) {
    throw new Error("Insufficient balance for deployment. Need at least 0.05 ETH");
  }

  try {
    // 1. Deploy SoulboundIdentityNFT (required for both contracts)
    console.log("\n1. Deploying SoulboundIdentityNFT...");
    const SoulboundIdentityNFT = await ethers.getContractFactory("SoulboundIdentityNFT");
    const identityNFT = await SoulboundIdentityNFT.deploy();
    await identityNFT.waitForDeployment();
    console.log("✅ SoulboundIdentityNFT deployed to:", await identityNFT.getAddress());

    // 2. Deploy AIOracle (required for DAOFactory)
    console.log("\n2. Deploying AIOracle...");
    const AIOracle = await ethers.getContractFactory("AIOracle");
    const aiOracle = await AIOracle.deploy();
    await aiOracle.waitForDeployment();
    console.log("✅ AIOracle deployed to:", await aiOracle.getAddress());

    // 3. Deploy ConsentraGovernanceToken (required for ConsentraDAOSimple)
    console.log("\n3. Deploying ConsentraGovernanceToken...");
    const ConsentraGovernanceToken = await ethers.getContractFactory("ConsentraGovernanceToken");
    const governanceToken = await ConsentraGovernanceToken.deploy(deployer.address);
    await governanceToken.waitForDeployment();
    console.log("✅ ConsentraGovernanceToken deployed to:", await governanceToken.getAddress());

    // 4. Deploy ConsentraDAOSimple
    console.log("\n4. Deploying ConsentraDAOSimple...");
    const ConsentraDAOSimple = await ethers.getContractFactory("ConsentraDAOSimple");
    const consentraDAO = await ConsentraDAOSimple.deploy(
      await governanceToken.getAddress(), 
      await identityNFT.getAddress()
    );
    await consentraDAO.waitForDeployment();
    console.log("✅ ConsentraDAOSimple deployed to:", await consentraDAO.getAddress());

    // 5. Deploy DAOFactorySimple
    console.log("\n5. Deploying DAOFactorySimple...");
    const DAOFactorySimple = await ethers.getContractFactory("DAOFactorySimple");
    const daoFactory = await DAOFactorySimple.deploy(
      await consentraDAO.getAddress(), // Use ConsentraDAOSimple as DAO implementation
      await governanceToken.getAddress(), // Use ConsentraGovernanceToken as token implementation
      await identityNFT.getAddress(),
      await aiOracle.getAddress()
    );
    await daoFactory.waitForDeployment();
    console.log("✅ DAOFactorySimple deployed to:", await daoFactory.getAddress());

    // 6. Mint test identity for deployer
    console.log("\n6. Minting test identity...");
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
    console.log("ConsentraGovernanceToken:", await governanceToken.getAddress());
    console.log("ConsentraDAOSimple:", await consentraDAO.getAddress());
    console.log("DAOFactorySimple:", await daoFactory.getAddress());
    console.log("Deployer:", deployer.address);

    console.log("\n💰 Remaining balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

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
