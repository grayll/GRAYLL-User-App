import { Component, OnInit } from '@angular/core';
import { faAt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-referral-header-boxes',
  templateUrl: './referral-header-boxes.component.html',
  styleUrls: ['./referral-header-boxes.component.css']
})
export class ReferralHeaderBoxesComponent implements OnInit {
  faAt = faAt;
  constructor() { }

  ngOnInit() {
  }

}
