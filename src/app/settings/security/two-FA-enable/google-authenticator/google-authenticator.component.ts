import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../../../shared/popup/popup.service';
import {Router} from '@angular/router';
import {SharedService} from '../../../../shared/shared.service';
import {AuthService} from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-two-factor-enable',
  templateUrl: './google-authenticator.component.html',
  styleUrls: ['./google-authenticator.component.css']
})
export class GoogleAuthenticatorComponent implements OnInit {

  @ViewChild('content') modal;
  Tfa: any = {}; 

  constructor(
    public popupService: PopupService,
    private router: Router,
    private sharedService: SharedService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.popupService.open(this.modal);

    // Call QRcode service
    this.setupTfa(this.authService.GetLocalUserData().Email)
  }
  setupTfa(account:string){
    this.authService.setupTfa(account).subscribe(data =>{
      //const result = data.body
      if (data['status'] === 200) {        
        this.Tfa.TempSecret = data.body['tempSecret'];
        this.Tfa.DataURL = data.body['dataURL']; 
        this.Tfa.Enable = true;        
        
        this.authService.userData.Tfa = this.Tfa;
        this.authService.SetLocalUserData();  
        console.log('google: setupTfa: userData', this.authService.userData)
      }
    })
  }

  next() {
    this.sharedService.showModalOverview();
    this.popupService.close()
    .then(() => {
      setTimeout(() => {
        this.router.navigate(['/settings/profile', {outlets: {popup: 'scan-qr-code'}}]);
      }, 50);
    })
    .catch((error) => console.log(error));
  }

}
