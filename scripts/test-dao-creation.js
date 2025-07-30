const { ethers } = require("hardhat");

async function main() {
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("Testing DAO creation with account:", deployer.address);

  // Deploy all contracts first
  const SoulboundIdentityNFT = await ethers.getContractFactory("SoulboundIdentityNFT");
  const identityNFT = await SoulboundIdentityNFT.deploy();
  await identityNFT.waitForDeployment();

  const AIOracle = await ethers.getContractFactory("AIOracle");
  const aiOracle = await AIOracle.deploy();
  await aiOracle.waitForDeployment();

  const AIVotingModule = await ethers.getContractFactory("AIVotingModule");
  const aiVotingModule = await AIVotingModule.deploy(await identityNFT.getAddress(), await aiOracle.getAddress());
  await aiVotingModule.waitForDeployment();

  const ProposalMetadataModule = await ethers.getContractFactory("ProposalMetadataModule");
  const proposalMetadataModule = await ProposalMetadataModule.deploy();
  await proposalMetadataModule.waitForDeployment();

  const ConsentraGovernanceToken = await ethers.getContractFactory("ConsentraGovernanceToken");
  const tokenImplementation = await ConsentraGovernanceToken.deploy(deployer.address);
  await tokenImplementation.waitForDeployment();

  const ConsentraDAO = await ethers.getContractFactory("ConsentraDAO");
  const daoImplementation = await ConsentraDAO.deploy(
    await tokenImplementation.getAddress(),
    ethers.ZeroAddress,
    await identityNFT.getAddress(),
    await aiVotingModule.getAddress(),
    await proposalMetadataModule.getAddress()
  );
  await daoImplementation.waitForDeployment();

  const DAOFactory = await ethers.getContractFactory("DAOFactory");
  const daoFactory = await DAOFactory.deploy(
    await daoImplementation.getAddress(),
    await tokenImplementation.getAddress(),
    await identityNFT.getAddress(),
    await aiOracle.getAddress()
  );
  await daoFactory.waitForDeployment();

  // Grant factory permission to mint tokens
  await tokenImplementation.transferOwnership(await daoFactory.getAddress());
  await proposalMetadataModule.grantRole(await proposalMetadataModule.DEFAULT_ADMIN_ROLE(), await daoFactory.getAddress());

  console.log("All contracts deployed successfully!");

  // Mint identity NFTs for test users
  await identityNFT.mintIdentity(deployer.address, ethers.keccak256(ethers.toUtf8Bytes("deployer")), "ipfs://deployer");
  await identityNFT.mintIdentity(user1.address, ethers.keccak256(ethers.toUtf8Bytes("user1")), "ipfs://user1");
  await identityNFT.mintIdentity(user2.address, ethers.keccak256(ethers.toUtf8Bytes("user2")), "ipfs://user2");

  console.log("Identity NFTs minted for test users");

  // Test DAO creation
  const daoConfig = {
    name: "Test DAO",
    tokenName: "Test Token",
    tokenSymbol: "TEST",
    initialSupply: ethers.parseEther("1000000"),
    votingDelay: 1,
    votingPeriod: 50400,
    proposalThreshold: 0,
    quorumPercentage: 4,
    timelockDelay: 86400 // 1 day
  };

  const initialMembers = [deployer.address, user1.address, user2.address];
  const initialAllocations = [
    ethers.parseEther("500000"),
    ethers.parseEther("250000"),
    ethers.parseEther("250000")
  ];

  console.log("Creating DAO...");
  const tx = await daoFactory.createDAO(daoConfig, initialMembers, initialAllocations);
  const receipt = await tx.wait();

  console.log("DAO created successfully!");
  console.log("Transaction hash:", tx.hash);

  // Get the created DAO info
  const daoId = 0; // First DAO
  const daoInfo = await daoFactory.getDAO(daoId);
  console.log("DAO Info:", {
    dao: daoInfo.dao,
    token: daoInfo.token,
    timelock: daoInfo.timelock,
    name: daoInfo.name,
    creator: daoInfo.creator,
    memberCount: daoInfo.memberCount
  });

  // Verify token balances
  const token = await ethers.getContractAt("ConsentraGovernanceToken", daoInfo.token);
  const deployerBalance = await token.balanceOf(deployer.address);
  const user1Balance = await token.balanceOf(user1.address);
  const user2Balance = await token.balanceOf(user2.address);

  console.log("Token balances:");
  console.log("Deployer:", ethers.formatEther(deployerBalance));
  console.log("User1:", ethers.formatEther(user1Balance));
  console.log("User2:", ethers.formatEther(user2Balance));

  console.log("DAO creation test completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 