import { Component, OnInit } from '@angular/core';
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import { SharedService } from '../shared/shared.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { ReferralService } from './referral.service';
import {SubSink} from 'subsink';

@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.css']
})
export class ReferralComponent implements OnInit {
  activeTabId: string;
  faWarning = faExclamationTriangle;
  subsink : SubSink

  initData(){
    this.referralService.metric = {totalFeeUsd: 0, totalFeeGRX: 0, totalPayment: 0, confirmed:0, pending:0}
    this.referralService.referralContacts = []
    this.referralService.referralTxs = []
    this.referralService.referer = {name: '', lname: '', email: '', phone:'', businessName:'', totalFeeGRX: 0, totalFeeUsd: 0, totalPayment: 0, time:0}   
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    public sharedService: SharedService,
    public authService: AuthService,
    public referralService: ReferralService,
  ) {
   // this.initData()
    this.subsink = new SubSink()
    this.loadDataFromRoute();
    this.referralService.subReferral()

    this.subsink.add(this.referralService._metric.subscribe(data => {
      console.log('metric:', data)
      if (data){
        this.referralService.metric = data
      }
    }))

    this.subsink.add(this.referralService._referer.subscribe(data => {
      console.log('referer:', data)
      if (data && data.length > 0){
        this.referralService.referer = data[0]
      }
    }))

    this.subsink.add(this.referralService._referralContacts.subscribe(data => {
      console.log('referralContacts:', data)
      if (data){
        this.referralService.referralContacts = data
      }
    }))

    this.subsink.add(this.referralService._referralTxs.subscribe(data => {
      console.log('referralTxs:', data)
      if (data){
        this.referralService.referralTxs = data
      }
    }))

    this.subsink.add(this.referralService._invites.subscribe(data => {
      console.log('invite:', data)
      if (data){
        this.referralService.invites = data
      }
    }))
  }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.changeBackgroundColor(true);
  }

  ngOnDestroy(): void {
    this.changeBackgroundColor(false);
  }

  private changeBackgroundColor(addClass: boolean) {
    const body = document.getElementsByTagName('body')[0];
    addClass ? body.classList.add('dark-navy-background') : body.classList.remove('dark-navy-background');
  }

  private loadDataFromRoute() {
    const data = this.activatedRoute.snapshot.data;
    if (data.scroll) {
      this.activeTabId = 'allAlgoPositions';
      setTimeout(() => {
        const el = document.getElementById('systemActivityTable');
        el.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
      }, 500);
    }
  }

}
