// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "./NftAuction.sol";

contract NFTAuctionManager{

    event AuctionCreated(address seller, uint auctionId);
    mapping(uint => address) public auctions;

    uint public auctionCount;

    constructor(){
    }

    function createAuction(address _nft, uint tokenId, uint startingBid ) public {

        NFTAuction nft = new NFTAuction(_nft, tokenId, startingBid, msg.sender, auctionCount);
        auctions[auctionCount]=address(nft);
        emit AuctionCreated(msg.sender, auctionCount);

        auctionCount++;       

    }

    function  getAuctionAddress(uint auctionId) public view returns(address) {
        return auctions[auctionId];
    }


}