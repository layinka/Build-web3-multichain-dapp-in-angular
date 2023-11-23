// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NFTAuction {
    IERC721 public nft;
    uint public nftId;

    uint public auctionId;

    address payable public seller;

    bool public started;
    bool public ended;

    uint public endAt;


    address public highestBidder;
    uint public highestBid;

    mapping (address => uint) public bids;

    event Started();
    event Bidded(address indexed bidder, uint bid);

    event Ended(address indexed bidder, uint highest);

    event Withdrawn(address bidder, uint amount);



    constructor(address _nft, uint tokenId, uint startingBid, address _seller, uint _auctionId)  {  
        nft= IERC721(_nft);
        nftId=tokenId;
        seller = payable(_seller);
        highestBid= startingBid;

        auctionId=_auctionId;

    }

    function start() external {
        require(!started,"Started already");
        require(seller==msg.sender, "Not Seller");

        nft.transferFrom(msg.sender, address(this), nftId );

        started = true;
        endAt = block.timestamp + 7 days;
        emit Started();
        
    }

    function bid() external payable {
        require(started==true,"Not Started");
        require(block.timestamp < endAt, "Auction Already ended");
        require(msg.value > highestBid, "not high enough" );

        highestBid=msg.value;
        highestBidder=msg.sender;

        bids[msg.sender]=highestBid;

        emit Bidded(msg.sender, highestBid);

    }

    function withdraw() external {
        require(ended, "OnlyAfterEnded");
        require(highestBidder!=msg.sender, "HighestBidderCantWithdraw");
        uint amount = bids[msg.sender];
        bids[msg.sender]=0;
        payable(msg.sender).transfer(amount);        

        emit Withdrawn(msg.sender, amount);
    }

    function end() external {
        require(started, "Not Active");
        require(!ended, "Already Ended");
        require(seller==msg.sender, "OnlySellerCanEnd");

        ended = true;

        if(highestBidder==address(0)){
            nft.transferFrom(address(this), seller, nftId);
        }else{
            nft.transferFrom(address(this), highestBidder, nftId);
            seller.transfer(highestBid);
            
        }

        emit Ended(highestBidder, highestBid);
    }  

    function details()   public view returns( address _seller,address _nft,uint _nftId,bool _started,bool _ended,uint _endA, address _highestBidder, uint _highestBid ){
        return(seller,address(nft), nftId,  started, ended, endAt,highestBidder, highestBid  );
    } 
}