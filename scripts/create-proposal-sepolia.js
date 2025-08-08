const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Creating governance proposal on Sepolia with account:", deployer.address);

  try {
    // Sepolia network addresses
    const sepoliaDAOAddress = "0xeAa9ece43cfF513fb8cA530453C4b085DBa163b6";
    const sepoliaIdentityNFTAddress = "0x649089512698e775404d3a0566B5F7fbF08B7292";
    const sepoliaGovernanceTokenAddress = "0x81EcAfa27889F6f4A9cca31e0aD2e5A362553808";

    console.log("\n=== Creating Proposal on Sepolia Network ===");
    console.log("DAO Address:", sepoliaDAOAddress);
    console.log("Identity NFT Address:", sepoliaIdentityNFTAddress);
    console.log("Governance Token Address:", sepoliaGovernanceTokenAddress);

    // Get contract instances
    const ConsentraDAOSimple = await ethers.getContractFactory("ConsentraDAOSimple");
    const sepoliaDAO = ConsentraDAOSimple.attach(sepoliaDAOAddress);

    const SoulboundIdentityNFT = await ethers.getContractFactory("SoulboundIdentityNFT");
    const sepoliaIdentityNFT = SoulboundIdentityNFT.attach(sepoliaIdentityNFTAddress);

    const ConsentraGovernanceToken = await ethers.getContractFactory("ConsentraGovernanceToken");
    const sepoliaGovernanceToken = ConsentraGovernanceToken.attach(sepoliaGovernanceTokenAddress);

    // Check if deployer has verified identity
    const isVerified = await sepoliaIdentityNFT.isVerified(deployer.address);
    console.log("Deployer identity verified:", isVerified);

    if (!isVerified) {
      console.log("❌ Deployer identity not verified. Cannot create proposal.");
      return;
    }

    // Check governance token balance
    const tokenBalance = await sepoliaGovernanceToken.balanceOf(deployer.address);
    console.log("Governance token balance:", ethers.formatEther(tokenBalance));

    // Check voting power using the token's getPastVotes function
    const currentBlock = await ethers.provider.getBlockNumber();
    const votingPower = await sepoliaGovernanceToken.getPastVotes(deployer.address, currentBlock - 1);
    console.log("Voting power:", ethers.formatEther(votingPower));

    // Create a proposal to transfer some tokens from the DAO (if it has any)
    // We'll create a proposal to transfer tokens to a test address
    const testRecipient = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Test address
    const transferAmount = ethers.parseEther("50"); // 50 tokens

    // Encode the transfer function call
    const transferCalldata = sepoliaGovernanceToken.interface.encodeFunctionData("transfer", [
      testRecipient,
      transferAmount
    ]);

    const targets = [sepoliaGovernanceTokenAddress]; // Target the governance token contract
    const values = [0]; // No ETH value
    const calldatas = [transferCalldata]; // The encoded transfer function call
    const description = "Sepolia Test Proposal: Transfer 50 governance tokens to test recipient";

    console.log("\n📋 Proposal Details:");
    console.log("Description:", description);
    console.log("Targets:", targets);
    console.log("Values:", values);
    console.log("Calldatas:", calldatas);
    console.log("Test Recipient:", testRecipient);
    console.log("Transfer Amount:", ethers.formatEther(transferAmount));

    console.log("\n🚀 Creating proposal on Sepolia...");
    const proposeTx = await sepoliaDAO.propose(targets, values, calldatas, description);
    
    console.log("Transaction hash:", proposeTx.hash);
    console.log("Waiting for transaction confirmation...");
    
    const receipt = await proposeTx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

    // Get the proposal ID from the event
    const proposalCreatedEvent = receipt.logs.find(log => {
      try {
        const parsed = sepoliaDAO.interface.parseLog(log);
        return parsed.name === "ProposalCreated";
      } catch {
        return false;
      }
    });

    if (proposalCreatedEvent) {
      const parsedEvent = sepoliaDAO.interface.parseLog(proposalCreatedEvent);
      const proposalId = parsedEvent.args.proposalId;
      const proposer = parsedEvent.args.proposer;
      const startBlock = parsedEvent.args.startBlock;
      const endBlock = parsedEvent.args.endBlock;
      const description = parsedEvent.args.description;

      console.log("\n🎉 Proposal Created Successfully on Sepolia!");
      console.log("Proposal ID:", proposalId.toString());
      console.log("Proposer:", proposer);
      console.log("Start Block:", startBlock.toString());
      console.log("End Block:", endBlock.toString());
      console.log("Description:", description);

      // Get proposal state
      const proposalState = await sepoliaDAO.state(proposalId);
      console.log("Proposal State:", proposalState.toString()); // 0 = Pending, 1 = Active, 2 = Canceled, 3 = Defeated, 4 = Succeeded, 5 = Queued, 6 = Expired, 7 = Executed

      // Get proposal details
      try {
        const proposal = await sepoliaDAO.proposals(proposalId);
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
