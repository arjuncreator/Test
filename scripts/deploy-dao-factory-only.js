const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying DAOFactory to testnet with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance));

  if (balance < ethers.parseEther("0.05")) {
    throw new Error("Insufficient balance for deployment. Need at least 0.05 ETH");
  }

  try {
    // 1. Deploy SoulboundIdentityNFT (required for DAOFactory)
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

    // 3. Deploy DAOFactory with minimal dependencies
    console.log("\n3. Deploying DAOFactory...");
    const DAOFactory = await ethers.getContractFactory("DAOFactory");
    const daoFactory = await DAOFactory.deploy(
      ethers.ZeroAddress, // Placeholder DAO implementation
      ethers.ZeroAddress, // Placeholder token implementation
      await identityNFT.getAddress(),
      await aiOracle.getAddress()
    );
    await daoFactory.waitForDeployment();
    console.log("✅ DAOFactory deployed to:", await daoFactory.getAddress());

    // 4. Mint test identity for deployer
    console.log("\n4. Minting test identity...");
    await identityNFT.mintIdentity(
      deployer.address, 
      ethers.keccak256(ethers.toUtf8Bytes("deployer")), 
      "ipfs://deployer"
    );
    console.log("✅ Test identity minted for deployer");

    console.log("\n🎉 DAOFactory deployment completed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log("SoulboundIdentityNFT:", await identityNFT.getAddress());
    console.log("AIOracle:", await aiOracle.getAddress());
    console.log("DAOFactory:", await daoFactory.getAddress());

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