import { Component } from '@angular/core';

import  nftAuctionManagerABI from '../../assets/abis/nftauctionmanager.json';
import  nftAuctionABI from '../../assets/abis/nftauction.json';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Web3Service } from '../web3.service';
import { erc721ABI, readContract, waitForTransaction, writeContract } from '@wagmi/core';
import { nftAuctionManagerAddress } from 'src/constants';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { write } from '@popperjs/core';
import { formatUnits, parseEther } from 'viem';


@Component({
  selector: 'app-view-auction',
  templateUrl: './view-auction.component.html',
  styleUrls: ['./view-auction.component.scss']
})
export class ViewAuctionComponent {

  auctionId?: any;
  auctionAddress?: string;

  auction?: any;

  mainFormGroup: FormGroup;

  nftMetadata: any;


  constructor(
    private fb: FormBuilder,
    public w3s:Web3Service,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private http:HttpClient
  ){
    this.mainFormGroup= this.fb.group(
      {
        bid: [0.01, [Validators.required, Validators.min(0)]]
      }
    )
  }

  ngOnInit(){
    
    this.route.params.subscribe((params)=>{
      this.auctionId = params['auctionId'];

      this.w3s.chainId$.subscribe(async (chainId)=>{
        if(!chainId) return;
        
        const address = await readContract({
          address: nftAuctionManagerAddress as `0x${string}`,
          abi: nftAuctionManagerABI,
          functionName: 'getAuctionAddress',
          args: [this.auctionId]

        })

        this.auctionAddress=address as string;

        //address _seller,address _nft,uint _nftId,bool _started,bool _ended,uint _endA, address _highestBidder, uint _highestBid
        const [seller, nft,tokenId, started, ended,endAt,highestBidder, highestBid] = (await readContract({
          address: this.auctionAddress as `0x${string}`,
          abi: nftAuctionABI,
          functionName: 'details',
          args: []

        }) ) as any

        this.auction={
          seller,
          nft,
          tokenId,
          started,
          ended,
          endAt,
          highestBidder,
          highestBid: formatUnits(highestBid , 18)
        };


        await this.getNftMetadata();       
  
  
      })



    })
    
  }

  async getNftMetadata(){
    const nftAddress = this.auction.nft;
    const tokenUri = await readContract({
      address: nftAddress,
      abi: erc721ABI,
      functionName:'tokenURI',
      args: [this.auction.tokenId.toString()]
    })

    this.http.get(tokenUri).subscribe((response)=>{
      this.nftMetadata=response
      
    },(error)=>{
      console.error(error)
    })

    
  }


  async startAuction(){
    try{
      //approve nft for contract
      let {hash: approveHash }= await writeContract({
        address: this.auction.nft,
        abi: erc721ABI,
        functionName: 'approve',
        args:[this.auctionAddress as  `0x${string}`, this.auction.tokenId]
      })

      let txApproveReceipt = await waitForTransaction({
        hash: approveHash
      })

      // startAuction
      if(txApproveReceipt.status=='success'){
        let {hash} = await writeContract({
          address: this.auctionAddress as `0x${string}`,
          abi: nftAuctionABI,
          functionName: 'start',
          args:[]
        });

        let txHash = await waitForTransaction({
          hash: hash
        })

        if(txHash.status== 'success'){
          this.auction.started=true;
          alert('Suceess')
        }



      }

       
    }catch(err){
      console.log('error: ', err)
    }
  }

  async endAuction(){
    let {hash} = await writeContract({
      address: this.auctionAddress as `0x${string}`,
      abi: nftAuctionABI,
      functionName: 'end',
      args:[]
    });

    let txHash = await waitForTransaction({
      hash: hash
    })

    if(txHash.status== 'success'){
      this.auction.ended=true;
      alert('Auction Ended')
    }
  }

  get f(){
    return this.mainFormGroup.controls;
  }

  async bid(){

    const amount = this.mainFormGroup.get('bid')?.value
    try{
       let {hash} = await writeContract({
        address: this.auctionAddress as `0x${string}`,
        abi: nftAuctionABI,
        functionName: 'bid',
        args:[],
        value: parseEther(amount.toString())
       })

       let txReceipt = await waitForTransaction({
        hash
       })
       if(txReceipt.status=='success'){
        alert("Your Bid was successful")
       }else{
        alert("Your Bid Failed")

       }

       window.location.reload();

    }catch(err){
      console.error(err)
    }
  }


}
