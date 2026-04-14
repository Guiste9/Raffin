// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./PropertyToken.sol";

contract PropertyFactory {
    
    address[] public allProperties;
    mapping(address => address[]) public propertiesByOwner;

    event PropertyCreated(
        address indexed propertyAddress,
        address indexed owner,
        string name,
        string symbol
    );

    function createProperty(
        string memory _name,
        string memory _symbol,
        uint256 _totalShares,
        uint256 _pricePerShare,
        string memory _propertyAddress,
        string memory _propertyImageIPFS,
        string memory _propertyDescription
    ) external returns (address) {
        PropertyToken newProperty = new PropertyToken(
            _name,
            _symbol,
            _totalShares,
            _pricePerShare,
            _propertyAddress,
            _propertyImageIPFS,
            _propertyDescription
        );

        allProperties.push(address(newProperty));
        propertiesByOwner[msg.sender].push(address(newProperty));

        emit PropertyCreated(
            address(newProperty),
            msg.sender,
            _name,
            _symbol
        );

        return address(newProperty);
    }

    function getAllProperties() external view returns (address[] memory) {
        return allProperties;
    }

    function getPropertiesByOwner(address _owner) external view returns (address[] memory) {
        return propertiesByOwner[_owner];
    }

    function totalProperties() external view returns (uint256) {
        return allProperties.length;
    }
}