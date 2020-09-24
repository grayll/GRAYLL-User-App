import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SnotifyService } from 'ng-snotify';

export interface AdminSetting {loginStatus?: boolean; signupStatus:boolean; 
	gry1Status:boolean; gry2Status:boolean;gry3Status:boolean;grzStatus:boolean;
	gry1NewPosition:boolean; gry2NewPosition:boolean;gry3NewPosition:boolean;grzNewPosition:boolean;
	systemStatus:boolean; systemNewPosition:boolean; pauseUntil:number;pauseClosing:boolean
}
export interface UserMeta {UrWallet: number; UrGRY1: number; UrGRY2: number; UrGRY3: number; UrGRZ: number; UrGeneral: number; OpenOrders: number; OpenOrdersGRX: number; 
	OpenOrdersXLM: number; GRX: number; XLM: number;
	total_grz_close_positions_ROI_$: number;
	total_grz_current_position_ROI_$: number;
	total_grz_current_position_value_$: number;
	total_grz_open_positions: number;

	total_gry1_close_positions_ROI_$: number;
	total_gry1_current_position_ROI_$: number;
	total_gry1_current_position_value_$: number;
	total_gry1_open_positions: number;

	total_gry2_close_positions_ROI_$: number;
	total_gry2_current_position_ROI_$: number;
	total_gry2_current_position_value_$: number;
	total_gry2_open_positions: number;

	total_gry3_close_positions_ROI_$: number;
	total_gry3_current_position_ROI_$: number;
	total_gry3_current_position_value_$: number;
	total_gry3_open_positions: number;

	signupStatus:number;
	gry1Status:number;
	gry2Status:number;
	gry3Status:number;
	grzStatus:number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

	public usersMeta: [] = []
	public adminSetting: AdminSetting
	public _adminSetting: Observable<AdminSetting> 
	constructor(private afs: AngularFirestore, private http: HttpClient, private snotifyService: SnotifyService) {

		this.adminSetting = {loginStatus:true, signupStatus:true, gry1Status:true, gry2Status:true, gry3Status:true, grzStatus:true,
			gry1NewPosition:true, gry2NewPosition:true, gry3NewPosition:true, grzNewPosition:true,systemStatus:true, systemNewPosition:true,
			pauseUntil:0, pauseClosing:false,
		}
	}

	subAdminSetting(){    
		if (!this._adminSetting){
			this._adminSetting = this.afs.doc<AdminSetting>('admin/8efngc9fgm12nbcxeq').valueChanges()
		}     
	}

	getUsersMeta(cursor){
		this.http.get("api/admin/v1/users/getusersmeta/"+cursor).subscribe(
		res => {
			if ((res as any).errCode == environment.SUCCESS){
				this.usersMeta = (res as any).usersMeta
				console.log(this.usersMeta)
			} else {
				this.usersMeta = []
			}
		}, err => {
			this.usersMeta = []
		})
	}

	show(id){
		let msg = ''
		let isshown = false
		if (!this.adminSetting.systemStatus){
			msg = "The Algo System is currently undergoing maintenance, please retry soon." 
			isshown = true			
		} else if (!this.adminSetting.systemNewPosition){
			msg= "The Algo System is currently undergoing maintenance, no new Algo positions can be opened at the moment, please retry soon."  
			isshown = true			
		} else {
			switch (id) {
				case 'GRY 1':				
				if (!this.adminSetting.gry1Status){
					msg = "GRY 1 is currently under maintenance, please check back soon."
					isshown = true
				} else if (!this.adminSetting.gry1NewPosition){
					msg="GRY 1 | Balthazar is currently undergoing maintenance, no new GRY 1 Algo positions can be opened at the moment, please retry soon."
					isshown = true
				}
				break
				case 'GRY 2':
				
				if (!this.adminSetting.gry2Status){
					msg = "GRY 2 is currently under maintenance, please check back soon."
					isshown = true
				} else if (!this.adminSetting.gry2NewPosition){
					msg = "GRY 2 | Kaspar is currently undergoing maintenance, no new GRY 2 Algo positions can be opened at the moment, please retry soon." 
					isshown = true
				}
				break
				case 'GRY 3':
				
				if (!this.adminSetting.gry3Status){
					msg = "GRY 3 is currently under maintenance, please check back soon."
					isshown = true
				} else if (!this.adminSetting.gry3NewPosition){
					msg= "GRY 3 | Melkior is currently undergoing maintenance, no new GRY 3 Algo positions can be opened at the moment, please retry soon."
					isshown = true
				}
				break
				case 'GRZ':
				
				if (!this.adminSetting.grzStatus){
					msg = "GRZ is currently under maintenance, please check back soon."
					isshown = true
				} else if (!this.adminSetting.grzNewPosition){
					msg= "GRZ | Arkady is currently undergoing maintenance, no new GRZ Algo positions can be opened at the moment, please retry soon."
					isshown = true
				}
				break			
			}
		}
		if (isshown){
			this.snotifyService.warning(msg, {
				timeout: -1,
				showProgressBar: false,
				closeOnClick: false,
				pauseOnHover: true
			});
		}
		return isshown
	}
	showClose(id){
		let msg = ''
		let isshown = false
		if (!this.adminSetting.systemStatus){
			msg = "The Algo System is currently undergoing maintenance, please retry soon." 
			isshown = true			
		} else {
			switch (id) {
				case 'GRY 1':				
				if (!this.adminSetting.gry1Status){
					msg = "GRY 1 is currently under maintenance, please check back soon."
					isshown = true
				}
				break
				case 'GRY 2':				
				if (!this.adminSetting.gry2Status){
					msg = "GRY 2 is currently under maintenance, please check back soon."
					isshown = true
				} 
				break
				case 'GRY 3':				
				if (!this.adminSetting.gry3Status){
					msg = "GRY 3 is currently under maintenance, please check back soon."
					isshown = true
				} 
				break
				case 'GRZ':				
				if (!this.adminSetting.grzStatus){
					msg = "GRZ is currently under maintenance, please check back soon."
					isshown = true
				} 
				break			
			}
		}
		if (isshown){
			this.snotifyService.warning(msg, {
				timeout: -1,
				showProgressBar: false,
				closeOnClick: false,
				pauseOnHover: true
			});
		}
		return isshown
	}

	

 
}
