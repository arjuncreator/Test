// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "./SoulboundIdentityNFT.sol";

/**
 * @title ConsentraDAOSimple
 * @dev Minimal DAO governance contract with sybil resistance
 */
contract ConsentraDAOSimple is 
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes
{
    SoulboundIdentityNFT public immutable identityNFT;

    error NotVerifiedIdentity();

    modifier onlyVerified() {
        if (!identityNFT.isVerified(msg.sender)) {
            revert NotVerifiedIdentity();
        }
        _;
    }

    constructor(
        IVotes _token,
        SoulboundIdentityNFT _identityNFT
    )
        Governor("ConsentraDAOSimple")
        GovernorSettings(1, 45818, 0) // 1 block delay, ~1 week voting, 0 proposal threshold
        GovernorVotes(_token)
    {
        identityNFT = _identityNFT;
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override onlyVerified returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    function castVote(uint256 proposalId, uint8 support) public override onlyVerified returns (uint256) {
        return super.castVote(proposalId, support);
    }

    // Required overrides
    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    function quorum(uint256 /* blockNumber */) public pure override returns (uint256) {
        return 1; // Minimum quorum of 1 token for demonstration
    }
}