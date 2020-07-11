import { Component, OnInit } from '@angular/core';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { LogoutService } from '../services/logout.service';

@Component({
  selector: 'app-maintain-screen',
  templateUrl: './maintain-screen.component.html',
  styleUrls: ['./maintain-screen.component.css']
})
export class MaintainScreenComponent {
  
  get loading(): boolean{
    return this.logoutService.loading;
  }

  constructor(private logoutService: LogoutService) { 
    //console.log('maintain screen')
  }

}
