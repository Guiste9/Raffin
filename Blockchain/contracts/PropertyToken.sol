// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyToken is ERC20, Ownable {
    
    string public propertyAddress;
    string public propertyImageIPFS;
    string public propertyDescription;
    uint256 public totalShares;
    uint256 public pricePerShare;

    bool public saleActive;

    event SharesPurchased(address indexed buyer, uint256 bought, uint256 amountPaid);
    event SaleStatusChanged(bool isActive);
    event PropertyMetadataUpdated(string newImageIPFS);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalShares,
        uint256 _pricePerShare,
        string memory _propertyAddress,
        string memory _propertyImageIPFS,
        string memory _propertyDescription
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        totalShares = _totalShares;
        pricePerShare = _pricePerShare;
        propertyAddress = _propertyAddress;
        propertyImageIPFS = _propertyImageIPFS;
        propertyDescription = _propertyDescription;
        saleActive = false;

        _mint(msg.sender, _totalShares * (10 ** decimals()));
    }

    function purchaseShares(uint256 _amount) external payable {
        require(saleActive, "venda nao esta disponivel");
        require(_amount > 0, "quantidade de acoes deve ser maior que zero");
        require(msg.value == _amount * pricePerShare, "valor incorreto");
        require(
            balanceOf(owner()) >= _amount * (10 ** decimals()),
            "Cotas insuficientes"
        );

        _transfer(owner(), msg.sender, _amount * (10 ** decimals()));

        (bool sucess, ) = payable(owner()).call{value: msg.value}("");
        require(sucess, "Falha ao transferir fundos para o proprietario");
        emit SharesPurchased(msg.sender, _amount, msg.value);
    }

    function setSaleActive(bool _active) external onlyOwner {
        saleActive = _active;
        emit SaleStatusChanged(_active);
        
    }

    function updatePropertyImage(string memory _newImageIPFS) external onlyOwner {
        propertyImageIPFS = _newImageIPFS;
        emit PropertyMetadataUpdated(_newImageIPFS);
    }

    function availableShares() external view returns (uint256) {
        return balanceOf(owner()) / (10 ** decimals());
        
    }
}