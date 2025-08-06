// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./SoulboundIdentityNFT.sol";
import "./AIOracle.sol";

/**
 * @title DAOFactorySimple
 * @dev Simplified DAO factory for creating new DAOs
 */
contract DAOFactorySimple is Ownable {
    using Clones for address;
    
    SoulboundIdentityNFT public immutable identityNFT;
    AIOracle public immutable aiOracle;
    
    address public daoImplementation;
    address public tokenImplementation;
    
    mapping(address => bool) public isDAO;
    address[] public deployedDAOs;
    
    event DAOCreated(address indexed daoAddress, address indexed creator, string name);
    event ImplementationUpdated(string contractType, address newImplementation);
    
    error InvalidImplementation();
    error DAOCreationFailed();
    
    constructor(
        address _daoImplementation,
        address _tokenImplementation,
        SoulboundIdentityNFT _identityNFT,
        AIOracle _aiOracle
    ) Ownable(msg.sender) {
        daoImplementation = _daoImplementation;
        tokenImplementation = _tokenImplementation;
        identityNFT = _identityNFT;
        aiOracle = _aiOracle;
    }
    
    function createDAO(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address[] memory initialMembers
    ) external returns (address daoAddress) {
        if (daoImplementation == address(0) || tokenImplementation == address(0)) {
            revert InvalidImplementation();
        }
        
        // Clone the DAO implementation
        daoAddress = daoImplementation.clone();
        
        // Clone the token implementation
        address tokenAddress = tokenImplementation.clone();
        
        // Initialize the DAO (this would need to be implemented in the DAO contract)
        // For now, we'll just mark it as a DAO
        isDAO[daoAddress] = true;
        deployedDAOs.push(daoAddress);
        
        emit DAOCreated(daoAddress, msg.sender, name);
        
        return daoAddress;
    }
    
    function updateDAOImplementation(address newImplementation) external onlyOwner {
        daoImplementation = newImplementation;
        emit ImplementationUpdated("DAO", newImplementation);
    }
    
    function updateTokenImplementation(address newImplementation) external onlyOwner {
        tokenImplementation = newImplementation;
        emit ImplementationUpdated("Token", newImplementation);
    }
    
    function getDeployedDAOs() external view returns (address[] memory) {
        return deployedDAOs;
    }
    
    function getDAOCount() external view returns (uint256) {
        return deployedDAOs.length;
    }
} 