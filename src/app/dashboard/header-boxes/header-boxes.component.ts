import {Component, OnDestroy, OnInit} from '@angular/core';
import { StellarService } from '../../authorization/services/stellar-service';
import {SubSink} from 'subsink';
import { AuthService } from "../../shared/services/auth.service"
import { HttpClient } from  '@angular/common/http';
import { interval } from 'rxjs';

@Component({
  selector: 'app-header-boxes',
  templateUrl: './header-boxes.component.html',
  styleUrls: ['./header-boxes.component.css']
})
export class HeaderBoxesComponent  implements OnDestroy, OnInit  {
  
  grxdb:any
  grydb:any
  grzdb:any
  timer:any
  subSink: SubSink

  constructor(
    private stellarService: StellarService,
    private authService: AuthService,
    private http: HttpClient,
  ) {    
    this.subSink = new SubSink()
    this.getDashBoardData()     
  }
  
  ngOnInit(){
    this.subSink.add(interval(60*60*60).subscribe(()=> {      
      this.getDashBoardData()      
    }))
  }
  ngOnDestroy(){
    this.subSink.unsubscribe()    
  }

  getDashBoardData(){
    this.http.post("api/v1/users/GetDashBoardInfo",
    {
      "coins":"grxusd,gryusd,grzusd"
    }).subscribe(
      data => {
        //console.log(data)
        let res = data as any
        if (res.db.grxusd){ 
          this.grxdb = res.db.grxusd
        }
        if (res.db.gryusd){ 
          this.grydb = res.db.gryusd
        }
        if (res.db.grzusd){ 
          this.grzdb = res.db.grzusd
        }
      },
      e => {
        console.log(e)
      }
    )
  }
}
