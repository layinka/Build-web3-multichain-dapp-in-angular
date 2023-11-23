import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuctionListComponent } from './auction-list/auction-list.component';
import { CreateAuctionComponent } from './create-auction/create-auction.component';
import { HomeComponent } from './home/home.component';
import { ViewAuctionComponent } from './view-auction/view-auction.component';

const routes: Routes = [
  {
    path:'',
    component: HomeComponent,
    pathMatch: 'full'
  },
  {
    path: 'create-auction',
    component: CreateAuctionComponent
  },
  {
    path: 'view-auction/:auctionId',
    component: ViewAuctionComponent
  },
  {
    path:'list-auction',
    component: AuctionListComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
