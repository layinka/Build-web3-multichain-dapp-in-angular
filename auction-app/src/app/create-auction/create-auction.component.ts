import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Web3Service } from '../web3.service';
import  nftAuctionManagerABI from '../../assets/abis/nftauctionmanager.json';
import { parseAbiItem, parseEther } from 'viem';
import { getPublicClient, waitForTransaction, writeContract } from '@wagmi/core';
import { getFilterLogs } from 'viem/actions';
import { createEventFilter } from 'viem/actions';
import { nftAuctionManagerAddress } from 'src/constants';

@Component({
  selector: 'app-create-auction',
  templateUrl: './create-auction.component.html',
  styleUrls: ['./create-auction.component.scss']
})
export class CreateAuctionComponent {
  mainFormGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private w3s:Web3Service,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
    
  ){
    this.mainFormGroup = this.fb.group(
      {
        nftAddress: ['', [Validators.required]],
        tokenId: ['', [Validators.required]],
        startPrice: [0, [Validators.required, Validators.min(0), Validators.max(10000)]]
      }
    )
  }


  get f(){
    return this.mainFormGroup.controls;
  }


  async onSubmit(){
    if(this.mainFormGroup.valid){
      

      const nftAddress = this.mainFormGroup.get('nftAddress')?.value;
      const nftTokenId = this.mainFormGroup.get('tokenId')?.value;
      const startPrice = parseEther( this.mainFormGroup.get('startPrice')?.value+'');

      const {hash }= await writeContract({
        address: nftAuctionManagerAddress,
        abi: nftAuctionManagerABI,
        functionName: 'createAuction',
        args: [nftAddress, nftTokenId, startPrice]
      }) 

      const txReceipt = await waitForTransaction({
        hash
      })

      if(txReceipt.status== 'success'){
        // Get the auctionid
        const publicClient = getPublicClient();

        //@ts-ignore
        const filter = await createEventFilter(publicClient, {
          address: nftAuctionManagerAddress,
          event: parseAbiItem('event AuctionCreated(address seller, uint auctionId)'),
        });

        //@ts-ignore
        const logs = await getFilterLogs(publicClient, {filter: filter})

        // logs args = [
        //   {seller: '', auctionId: 1},
        //   {id}
        // ]

        // logs[0]['args']['seller']
        const auctionId = logs[0]['args']['auctionId']

        console.log('Auction Id:', auctionId)

        //redirect to the auctin page
        this.router.navigate(['view-auction',auctionId])
        
      }else{
        alert('Error Creating Auction')
      }

      // 



    }
  }
}
