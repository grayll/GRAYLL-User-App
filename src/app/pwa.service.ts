import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

declare var addToHomescreen;

@Injectable({
  providedIn: 'root'
})
export class PwaService {

  ath;

  constructor(private swUpdate: SwUpdate) { 

    this.ath = addToHomescreen({
      autostart: false,
      logging: true,
      displayPace: 0,
      onShow: function () {
        //console.log("showing");
      },
      onInit: function () {
        //console.log("initializing");
      },
      onAdd: function () {
        //console.log("adding");
      },
      onInstall: function () {
        //console.log("Installing");
      },
      onCancel: function () {
        //console.log("Cancelling");
      },
      customCriteria: function () {
        return true;
      },
    });

  }

  

  installApp() {
    //console.log("Application triggered.");
    //this.ath.clearSession();
    //this.ath.trigger();
    let isApplicationInstalled=this.ath.checkApplicationInstalled();
    console.log(isApplicationInstalled);
    if (isApplicationInstalled)
    {
      window.alert("Application already installed. Please check application page.");
    }
    else{
      this.ath.tryInstall();
    }
    
  }

  getBrowserPlatform(){
    return this.ath.getBrowserPlatform();
  }
}
