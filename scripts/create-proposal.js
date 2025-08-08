const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Creating governance proposal with account:", deployer.address);

  try {
    // Local network addresses
    const localDAOAddress = "0x856e4424f806D16E8CBC702B3c0F2ede5468eae5";
    const localIdentityNFTAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const localGovernanceTokenAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

    console.log("\n=== Creating Proposal on Local Network ===");
    console.log("DAO Address:", localDAOAddress);
    console.log("Identity NFT Address:", localIdentityNFTAddress);
    console.log("Governance Token Address:", localGovernanceTokenAddress);

    // Get contract instances
    const ConsentraDAOSimple = await ethers.getContractFactory("ConsentraDAOSimple");
    const localDAO = ConsentraDAOSimple.attach(localDAOAddress);

    const SoulboundIdentityNFT = await ethers.getContractFactory("SoulboundIdentityNFT");
    const localIdentityNFT = SoulboundIdentityNFT.attach(localIdentityNFTAddress);

    const ConsentraGovernanceToken = await ethers.getContractFactory("ConsentraGovernanceToken");
    const localGovernanceToken = ConsentraGovernanceToken.attach(localGovernanceTokenAddress);

    // Check if deployer has verified identity
    const isVerified = await localIdentityNFT.isVerified(deployer.address);
    console.log("Deployer identity verified:", isVerified);

    if (!isVerified) {
      console.log("❌ Deployer identity not verified. Cannot create proposal.");
      return;
    }

    // Check governance token balance
    const tokenBalance = await localGovernanceToken.balanceOf(deployer.address);
    console.log("Governance token balance:", ethers.formatEther(tokenBalance));

    // Check voting power using the token's getPastVotes function
    const currentBlock = await ethers.provider.getBlockNumber();
    const votingPower = await localGovernanceToken.getPastVotes(deployer.address, currentBlock - 1);
    console.log("Voting power:", ethers.formatEther(votingPower));

    // Create a proposal to transfer some tokens from the DAO (if it has any)
    // We'll create a proposal to transfer tokens to a test address
    const testRecipient = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Account #1
    const transferAmount = ethers.parseEther("200"); // 200 tokens

    // Encode the transfer function call
    const transferCalldata = localGovernanceToken.interface.encodeFunctionData("transfer", [
      testRecipient,
      transferAmount
    ]);

    const targets = [localGovernanceTokenAddress]; // Target the governance token contract
    const values = [0]; // No ETH value
    const calldatas = [transferCalldata]; // The encoded transfer function call
    const description = "Local Test Proposal: Transfer 200 governance tokens to test recipient";

    console.log("\n📋 Proposal Details:");
    console.log("Description:", description);
    console.log("Targets:", targets);
    console.log("Values:", values);
    console.log("Calldatas:", calldatas);
    console.log("Test Recipient:", testRecipient);
    console.log("Transfer Amount:", ethers.formatEther(transferAmount));

    console.log("\n🚀 Creating proposal...");
    const proposeTx = await localDAO.propose(targets, values, calldatas, description);
    
    console.log("Transaction hash:", proposeTx.hash);
    console.log("Waiting for transaction confirmation...");
    
    const receipt = await proposeTx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

    // Get the proposal ID from the event
    const proposalCreatedEvent = receipt.logs.find(log => {
      try {
        const parsed = localDAO.interface.parseLog(log);
        return parsed.name === "ProposalCreated";
      } catch {
        return false;
      }
    });

    if (proposalCreatedEvent) {
      const parsedEvent = localDAO.interface.parseLog(proposalCreatedEvent);
      const proposalId = parsedEvent.args.proposalId;
      const proposer = parsedEvent.args.proposer;
      const startBlock = parsedEvent.args.startBlock;
      const endBlock = parsedEvent.args.endBlock;
      const description = parsedEvent.args.description;

      console.log("\n🎉 Proposal Created Successfully!");
      console.log("Proposal ID:", proposalId.toString());
      console.log("Proposer:", proposer);
      console.log("Start Block:", startBlock.toString());
      console.log("End Block:", endBlock.toString());
      console.log("Description:", description);

      // Get proposal state
      const proposalState = await localDAO.state(proposalId);
      console.log("Proposal State:", proposalState.toString()); // 0 = Pending, 1 = Active, 2 = Canceled, 3 = Defeated, 4 = Succeeded, 5 = Queued, 6 = Expired, 7 = Executed

      // Get proposal details
      try {
        const proposal = await localDAO.proposals(proposalId);
        console.log("\n📊 Proposal Details:");
        console.log("Proposer:", proposal.proposer);
        console.log("Vote Start:", proposal.voteStart.toString());
        console.log("Vote End:", proposal.voteEnd.toString());
        console.log("Executed:", proposal.executed);
        console.log("Canceled:", proposal.canceled);
      } catch (error) {
        console.log("\n⚠️ Could not get detailed proposal info:", error.message);
      }

    } else {
      console.log("❌ Could not find ProposalCreated event in transaction receipt");
    }

    console.log("\n💰 Remaining balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  } catch (error) {
    console.error("❌ Proposal creation failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
