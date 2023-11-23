import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { nftAuctionManagerAddress } from 'src/constants';
import { erc721ABI, readContract } from '@wagmi/core';
import { Web3Service } from '../web3.service';
import  nftAuctionManagerABI from '../../assets/abis/nftauctionmanager.json';
import  nftAuctionABI from '../../assets/abis/nftauction.json';
import { formatUnits } from 'viem';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-auction-list',
  templateUrl: './auction-list.component.html',
  styleUrls: ['./auction-list.component.scss']
})
export class AuctionListComponent {

  auctions?: any[];

  constructor(
    private fb: FormBuilder,
    public w3s:Web3Service,
    private route: ActivatedRoute,
    private router: Router,
    private http:HttpClient
  ){
    
  }

  async ngOnInit(){
    this.w3s.chainId$.subscribe(async (chainId)=>{
      if(!chainId) return

      const auctionCount = await readContract({
        address: nftAuctionManagerAddress as `0x${string}`,
        abi: nftAuctionManagerABI,
        functionName: 'auctionCount',
        args:[]
      })

      // 5 = 0,1,2,3,4
      const keys = Array(parseInt((auctionCount as any).toString())).fill(undefined)

      this.auctions=[]
      
      await Promise.all(
        keys.map(async (element, index)=>{
          const auctionAddress = await readContract({
            address: nftAuctionManagerAddress as `0x${string}`,
            abi: nftAuctionManagerABI,
            functionName: 'getAuctionAddress',
            args:[index]
          })

          const [seller, nft,tokenId, started, ended,endAt,highestBidder, highestBid] = (await readContract({
            address: auctionAddress as `0x${string}`,
            abi: nftAuctionABI,
            functionName: 'details',
            args: []
  
          }) ) as any
  
          let auction={
            auctionId: index,
            seller,
            nft,
            tokenId,
            started,
            ended,
            endAt,
            highestBidder,
            highestBid: formatUnits(highestBid , 18),
            nftMetadata : await lastValueFrom( ( await this.getNftMetadata(nft,tokenId)))
          }; 

          this.auctions?.push(auction)


        })
      )

    })
  }

  async getNftMetadata(nftAddress: string, tokenId: any){
    
    const tokenUri = await readContract({
      address: nftAddress as `0x${string}`,
      abi: erc721ABI,
      functionName:'tokenURI',
      args: [tokenId.toString()]
    })

    return this.http.get(tokenUri)

    
  }


}
