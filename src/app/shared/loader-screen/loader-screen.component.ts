import { Component, OnInit } from '@angular/core';
import { LoadingService } from 'src/app/shared/services/loading.service';

@Component({
  selector: 'app-loader-screen',
  templateUrl: './loader-screen.component.html',
  styleUrls: ['./loader-screen.component.css']
})
export class LoaderScreenComponent {
  
  get loading(): boolean{
    return this.loadingService.loading;
  }

  constructor(private loadingService: LoadingService) { }

}
