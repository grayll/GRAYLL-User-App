import { Component, OnInit } from '@angular/core';
import { faAt } from '@fortawesome/free-solid-svg-icons';
import { ReferralService } from '../referral.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-referral-header-boxes',
  templateUrl: './referral-header-boxes.component.html',
  styleUrls: ['./referral-header-boxes.component.css']
})
export class ReferralHeaderBoxesComponent implements OnInit {
  faAt = faAt;
  constructor(
    public referralService: ReferralService,
    public authService: AuthService) {
      console.log(referralService.metric)
    }

  ngOnInit() {
  }

}
