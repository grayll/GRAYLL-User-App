import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SnotifyService } from 'ng-snotify';

export interface AdminSetting {loginStatus?: boolean; signupStatus:boolean; 
	gry1Status:boolean; gry2Status:boolean;gry3Status:boolean;grzStatus:boolean;
	gry1NewPosition:boolean; gry2NewPosition:boolean;gry3NewPosition:boolean;grzNewPosition:boolean;
	systemStatus:boolean; systemNewPosition:boolean;
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
	constructor(private afs: AngularFirestore, private http: HttpClient, private snotifyService: SnotifyService,) {

		this.adminSetting = {loginStatus:true, signupStatus:true, gry1Status:true, gry2Status:true, gry3Status:true, grzStatus:true,
			gry1NewPosition:true, gry2NewPosition:true, gry3NewPosition:true, grzNewPosition:true,systemStatus:true, systemNewPosition:true
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

	get isNewGRY1UserAccessActive(): boolean {
		return this._isNewGRY1UserAccessActive;
	}
	
	set isNewGRY1UserAccessActive(value: boolean) {
		this._isNewGRY1UserAccessActive = value;
	}
	
	get isNewGRY2UserAccessActive(): boolean {
		return this._isNewGRY2UserAccessActive;
	}
	
	set isNewGRY2UserAccessActive(value: boolean) {
		this._isNewGRY2UserAccessActive = value;
	}
	
	get isNewGRY3UserAccessActive(): boolean {
		return this._isNewGRY3UserAccessActive;
	}
	
	set isNewGRY3UserAccessActive(value: boolean) {
		this._isNewGRY3UserAccessActive = value;
	}
	
	get isNewGRZUserAccessActive(): boolean {
		return this._isNewGRZUserAccessActive;
	}
	
	set isNewGRZUserAccessActive(value: boolean) {
		this._isNewGRZUserAccessActive = value;
	}
	
	private _gry1FunctionActivated: boolean;
	private _gry2FunctionActivated: boolean;
	private _gry3FunctionActivated: boolean;
	private _grzFunctionActivated: boolean;
	private _algoSystemActivated: boolean;
	private _gry1NewUserActivated: boolean;
	private _gry2NewUserActivated: boolean;
	private _gry3NewUserActivated: boolean;
	private _grzNewUserActivated: boolean;
	private _algoSystemNewUserActivated: boolean;
	private _isUserSignUpPaused: boolean;
	private _isNewUserSignUpPaused: boolean;
	private _isUserSignInPaused: boolean;
	private _isNewUserSignInPaused: boolean;
	private _didRunFunction4: boolean;
	private _didRunFunction3: boolean;
	private _didRunFunction2: boolean;
	private _isGRY1UserAccessActive: boolean;
	private _isGRY2UserAccessActive: boolean;
	private _isGRY3UserAccessActive: boolean;
	private _isGRZUserAccessActive: boolean;
	private _isNewGRY1UserAccessActive: boolean;
	private _isNewGRY2UserAccessActive: boolean;
	private _isNewGRY3UserAccessActive: boolean;
	private _isNewGRZUserAccessActive: boolean;
	
	get isGRY1UserAccessActive(): boolean {
		return this._isGRY1UserAccessActive;
	}
	
	set isGRY1UserAccessActive(value: boolean) {
		this._isGRY1UserAccessActive = value;
	}
	
	get isGRY2UserAccessActive(): boolean {
		return this._isGRY2UserAccessActive;
	}
	
	set isGRY2UserAccessActive(value: boolean) {
		this._isGRY2UserAccessActive = value;
	}
	
	get isGRY3UserAccessActive(): boolean {
		return this._isGRY3UserAccessActive;
	}
	
	set isGRY3UserAccessActive(value: boolean) {
		this._isGRY3UserAccessActive = value;
	}
	
	get isGRZUserAccessActive(): boolean {
		return this._isGRZUserAccessActive;
	}
	
	set isGRZUserAccessActive(value: boolean) {
		this._isGRZUserAccessActive = value;
	}
	
	get isNewUserSignUpPaused(): boolean {
		return this._isNewUserSignUpPaused;
	}
	
	set isNewUserSignUpPaused(value: boolean) {
		this._isNewUserSignUpPaused = value;
	}
	
	get isNewUserSignInPaused(): boolean {
		return this._isNewUserSignInPaused;
	}
	
	set isNewUserSignInPaused(value: boolean) {
		this._isNewUserSignInPaused = value;
	}
	
	get didRunFunction4(): boolean {
		return this._didRunFunction4;
	}
	
	set didRunFunction4(value: boolean) {
		this._didRunFunction4 = value;
	}
	
	get didRunFunction3(): boolean {
		return this._didRunFunction3;
	}
	
	set didRunFunction3(value: boolean) {
		this._didRunFunction3 = value;
	}
	
	get didRunFunction2(): boolean {
		return this._didRunFunction2;
	}
	
	set didRunFunction2(value: boolean) {
		this._didRunFunction2 = value;
	}
	
	get isUserSignUpPaused(): boolean {
		return this._isUserSignUpPaused;
	}
	
	set isUserSignUpPaused(value: boolean) {
		this._isUserSignUpPaused = value;
	}
	
	get isUserSignInPaused(): boolean {
		return this._isUserSignInPaused;
	}
	
	set isUserSignInPaused(value: boolean) {
		this._isUserSignInPaused = value;
	}
	
	get gry1FunctionActivated(): boolean {
    return this._gry1FunctionActivated;
  }

  set gry1FunctionActivated(value: boolean) {
    this._gry1FunctionActivated = value;
  }

  get gry2FunctionActivated(): boolean {
    return this._gry2FunctionActivated;
  }

  set gry2FunctionActivated(value: boolean) {
    this._gry2FunctionActivated = value;
  }

  get gry3FunctionActivated(): boolean {
    return this._gry3FunctionActivated;
  }

  set gry3FunctionActivated(value: boolean) {
    this._gry3FunctionActivated = value;
  }

  get grzFunctionActivated(): boolean {
    return this._grzFunctionActivated;
  }

  set grzFunctionActivated(value: boolean) {
    this._grzFunctionActivated = value;
  }

  get algoSystemActivated(): boolean {
    return this._algoSystemActivated;
  }

  set algoSystemActivated(value: boolean) {
    this._algoSystemActivated = value;
  }
  
  get gry1NewUserActivated(): boolean {
    return this._gry1NewUserActivated;
  }

  set gry1NewUserActivated(value: boolean) {
    this._gry1NewUserActivated = value;
  }

  get gry2NewUserActivated(): boolean {
    return this._gry2NewUserActivated;
  }

  set gry2NewUserActivated(value: boolean) {
    this._gry2NewUserActivated = value;
  }

  get gry3NewUserActivated(): boolean {
    return this._gry3NewUserActivated;
  }

  set gry3NewUserActivated(value: boolean) {
    this._gry3NewUserActivated = value;
  }

  get grzNewUserActivated(): boolean {
    return this._grzNewUserActivated;
  }

  set grzNewUserActivated(value: boolean) {
    this._grzNewUserActivated = value;
  }

  get algoSystemNewUserActivated(): boolean {
    return this._algoSystemNewUserActivated;
  }

  set algoSystemNewUserActivated(value: boolean) {
    this._algoSystemNewUserActivated = value;
  }
  
  setDidRunAllFunctionsTo(didRun: boolean) {
		this._didRunFunction2 = didRun;
		this.didRunFunction3 = didRun;
		this.didRunFunction4 = didRun;
  }

 
}
