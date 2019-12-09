import {Component, NgZone,Input, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {faBell, faChartBar, faChartLine, faCommentAlt, faPowerOff, faUser, faWallet} from '@fortawesome/free-solid-svg-icons';
import {NotificationsService} from '../../../notifications/notifications.service';
import {AuthService} from 'src/app/shared/services/auth.service'
import { StellarService } from 'src/app/authorization/services/stellar-service'
import {SubSink} from 'subsink'
import { SwUpdate, SwPush } from '@angular/service-worker';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnDestroy {

  

  @Input() isGetAccountData: boolean;

  isNavbarCollapsed = false;
  faPowerOff = faPowerOff;
  faUser = faUser;
  faBell = faBell;
  faComment = faCommentAlt;
  faChartBar = faChartBar;
  faWallet = faWallet;
  faChartLine = faChartLine;

  walletNotices: number = 0
  algoNotices: number = 0
  generalNotices: number = 0 
  subsink:SubSink

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone:NgZone,
    public notificationsService: NotificationsService,
    public push: SwPush,
    public stellarService: StellarService,
  ) { 
    this.subsink = new SubSink()    
    if (!this.authService.userData){
      console.log('NAV.GetLocalUserData()')
      this.authService.GetLocalUserData()
    }
    console.log('navbar.subscribe')
    //if (this.isGetAccountData){
      Promise.all([
        this.stellarService.getCurrentGrxPrice1(),
        this.stellarService.getCurrentXlmPrice1(),
        this.stellarService.getAccountBalance(this.authService.userData.PublicKey)
        .catch(err => {
          // Notify internet connection.
          //this.snotifyService.simple('Please check your internet connection.')
          console.log(err)
        })
      ])
      .then(([ grxPrice, xlmPrice, balances ]) => {         
        this.authService.userData.totalGRX = (balances as any).grx;
        this.authService.userData.totalXLM = (balances as any).xlm;
        this.authService.userData.xlmPrice = xlmPrice
        this.authService.userData.grxPrice = grxPrice
        this.authService.SetLocalUserData()
        console.log('NAV.this.authService.userData.xlmPrice:', this.authService.userData.xlmPrice)
        console.log('NAV.totalGRX:', this.authService.userData.totalGRX)
        console.log('NAV.totalXLM:', this.authService.userData.totalXLM)
        
      }) 
    //}

    this.subsink.add(push.messages.subscribe(msg => {
      let data = (msg as any).notification
      //console.log('navbar.subscribe-data1:', data)
      if (data.type === 'wallet'){
        this.walletNotices +=1
        this.authService.userData.UrWallet += 1
        console.log('navbar.subscribe:walletNotices:', this.walletNotices)
        if (data.asset === 'XLM'){
          let amount = +data.amount
          this.authService.userData.totalXLM = (+this.authService.userData.totalXLM + amount).toFixed(7)
        } else if( data.asset === 'GRX' || data.asset === 'GRXT'){
          let amount = +data.amount
          console.log('navbar.amount:', data.amount)
          console.log('navbar.subscribe:totalGRX0:', this.authService.userData.totalGRX)
          this.authService.userData.totalGRX = (+this.authService.userData.totalGRX + amount).toFixed(7)
          console.log('navbar.subscribe:totalGRX1:', this.authService.userData.totalGRX)
        }   
        this.authService.SetLocalUserData()     
      }
    }));
    //push.notificationClicks.subscribe(click => console.log('WalletComponent-notification click', click));
    this.subsink.add(this.notificationsService.subsNumberNotices().subscribe(numberNotices => {
      // numberNotice number could be -/+
      if (!this.authService.userData){
        this.authService.GetLocalUserData()
      }
      if (this.walletNotices + numberNotices[0] >= 0){
        this.walletNotices = this.walletNotices + numberNotices[0]        
        this.authService.userData.UrWallet = this.walletNotices
      }
      if (this.algoNotices + numberNotices[1] >= 0){
        this.algoNotices = this.algoNotices + numberNotices[1]
        this.authService.userData.UrAlgo = this.algoNotices
      }
      if (this.generalNotices + numberNotices[2] >= 0){
        this.generalNotices = this.generalNotices + numberNotices[2]
        this.authService.userData.UrGeneral = this.generalNotices
      }
    })) 
    
    // var StellarSdk = require('stellar-sdk')
    // var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

    // var paymentHandler = function (paymentResponse) {
    //   console.log(paymentResponse);
    // };

    // var es = server.payments()
    //   .forAccount("GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ")
    //   .cursor('now')
    //   .stream({
    //     onmessage: paymentHandler
    //   })
  }

  ngOnDestroy():void {
    this.subsink.unsubscribe()
  }

  signOut(){
    
    //this.authService.SignOut();
    // console.log('GetLocalUserData:', this.authService.GetLocalUserData())
    // this.ngZone.run(()=>{
    //   //this.router.navigate(['/login'])
    // })
    console.log('GetLocalUserData:', this.authService.GetLocalUserData())
    localStorage.removeItem('user');    
    this.authService.userData = null  
    this.ngZone.run(()=> {
      this.router.navigateByUrl('/login')
      // return this.firebaseAuth.auth.signOut().then(() => {
      //   console.log('SignOut')
      //   localStorage.removeItem('user');
      //   this.userData = null  
      // }).catch(err =>{
      //   console.log('Err:', err)
      // })
    })
  }

}
