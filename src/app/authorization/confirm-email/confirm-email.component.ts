import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {ErrorService} from '../../shared/error/error.service';
import axios from 'axios';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.css']
})
export class ConfirmEmailComponent implements OnInit {
  private email:string = "hello@grayll.io"
  private name:string = ''
  constructor(private router: Router, private errorService: ErrorService) {
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
    console.log(this.email)
    console.log(this.name)
    //axios.post('https://grayll-app-bqqlgbdjbq-uc.a.run.app/api/v1/users/resendemail', {email: this.email, name:this.name}, {
    axios.post('http://127.0.0.1:8080/api/v1/users/resendemail', {email: this.email, name:this.name}, {
      headers: {
          'Content-Type': 'application/json',
      }
    })             
    .then(response => {  
      let content = ''
      switch (response.data.errCode){
        case 12:
            content = "The email is not registered yet"           
            break
        case 13:
            content = "The email is verified"    
            break        
        default:
            content = `The confirm email is sent to email ${this.email}`
            break
      }
      this.errorService.handleError(null, content)
    })
    .catch( error => {               
      this.errorService.handleError(null, 'Can not register now. Please try again later!')     
    }); 
  }

}
