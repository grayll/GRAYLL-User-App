import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {ErrorService} from '../../shared/error/error.service';
import axios from 'axios';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.css']
})
export class ConfirmEmailComponent implements OnInit {
  public email:string = "hello@grayll.io"
  private name:string = ''
  constructor(private router: Router, private errorService: ErrorService, private http: HttpClient,) {
    if (this.router.getCurrentNavigation().extras && this.router.getCurrentNavigation().extras.state 
      && this.router.getCurrentNavigation().extras.state.email && this.router.getCurrentNavigation().extras.state.email != ''){
      this.email = this.router.getCurrentNavigation().extras.state.email      
      this.name = this.router.getCurrentNavigation().extras.state.name
    } else {
      this.router.navigateByUrl('/login/register')
    }
  }

  didResent: boolean; 

  ngOnInit() {
  }

  resendEmail() {
    this.didResent = true;    
    this.http.post(`api/v1/accounts/resendemail`, {email: this.email, name:this.name})             
    .subscribe(res => {  
      let content = ''
      switch ((res as any).errCode){
        case 12:
            content = "This email address is not registered yet."          
            break
        case 13:
            content = "The email address is verified."    
            break        
        default:
            content = `The confirmation email has been sent to ${this.email}`
            break
      }
      this.errorService.handleError(null, content)
    },
    error => {              
      this.errorService.handleError(null, `The email verification request can't be completed! Please retry.`)    
    })
  }

}
