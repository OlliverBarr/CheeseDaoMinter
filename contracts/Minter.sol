// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./AbstractERC1155Factory.sol";

contract Minter is AbstractERC1155Factory  {
    using Counters for Counters.Counter;

    Counters.Counter private mpCounter; 
    address DAO;

    ERC20 private paymentToken;

    mapping(uint256 => NFT) public NFTs;
    
    event Claimed(uint index, address indexed account, uint amount);

    struct NFT {
        uint256 windowOpens;
        uint256 windowCloses;
        uint256 mintPrice;
        string JSONdata;
        ERC20 paymentToken;
        uint256 maxSupply;
    }

    constructor(
        string memory _name, 
        string memory _symbol,
        address _DAO
    ) ERC1155("") {
        name_ = _name;
        symbol_ = _symbol;
        DAO = _DAO;
    }

    function addNFT(
        uint256 _windowOpens,
        uint256 _windowCloses,
        uint256 _mintPrice,
        string memory _JSONdata,
        ERC20 _purchaseToken,
        uint256 _maxSupply
    ) external onlyOwner {
        require(_windowOpens < _windowCloses, "open window must be before close window");
        require(_windowOpens > 0 && _windowCloses > 0, "window cannot be 0");

        NFT storage nft = NFTs[mpCounter.current()];
        nft.windowOpens = _windowOpens;
        nft.windowCloses = _windowCloses;
        nft.mintPrice = _mintPrice;
        nft.JSONdata = _JSONdata;
        nft.paymentToken = _purchaseToken;
        nft.maxSupply = _maxSupply;

        mpCounter.increment();
    }

    function editNFT(
        uint256 _windowOpens, 
        uint256 _windowCloses, 
        uint256 _mintPrice, 
        string memory _JSONdata,        
        ERC20 _purchaseToken, 
        uint256 index,
        uint256 _maxSupply
    ) external onlyOwner {
        require(_windowOpens < _windowCloses, "open window must be before close window");
        require(_windowOpens > 0 && _windowCloses > 0, "window cannot be 0");

        NFT storage nft = NFTs[index];
        nft.windowOpens = _windowOpens;
        nft.windowCloses = _windowCloses;
        nft.mintPrice = _mintPrice;
        nft.JSONdata = _JSONdata;
        nft.paymentToken = _purchaseToken;
        nft.maxSupply = _maxSupply;
    }       


    function purchase(
        uint256 index,
        uint256 amount
    ) external {

        // verify contract is not paused
        require(!paused(), "Purchasing is paused");
        // verify given index exists
        require(NFTs[index].windowOpens != 0, "That NFT does not exist");
        // Verify within window
        require (block.timestamp > NFTs[index].windowOpens && block.timestamp < NFTs[index].windowCloses, "Claim: time window closed");
        // Verify there is still supply
        require (NFTs[index].maxSupply >= amount, "Max supply reached");
        uint256 fundsAllowance = NFTs[index].paymentToken.allowance(msg.sender, address(this));
        require (fundsAllowance >= NFTs[index].mintPrice, "not enough funds approved");

        NFTs[index].paymentToken.transferFrom(msg.sender, DAO, NFTs[index].mintPrice);
        NFTs[index].maxSupply -= amount;
        _mint(msg.sender, index, amount, "");
        
        emit Claimed(index, msg.sender, amount);
    }

    function adminMint(
        uint256 index,
        uint256 amount
    ) external onlyOwner {
        require(NFTs[index].maxSupply >= amount, "Max supply reached");
        NFTs[index].maxSupply -= amount;
        _mint(msg.sender, index, amount, "");
        emit Claimed(index, msg.sender, amount);
    }

    function uri(uint256 _id) public view override returns (string memory) {
            require(totalSupply(_id) > 0, "URI: nonexistent token");
            
            return string(abi.encodePacked(super.uri(_id), NFTs[_id].JSONdata));
    }    
}
