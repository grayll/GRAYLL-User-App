import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../../shared/popup/popup.service';
import {ErrorService} from '../../../shared/error/error.service';
import {Router} from '@angular/router';
import {SharedService} from '../../../shared/shared.service';

@Component({
  selector: 'app-change-phone-number',
  templateUrl: './change-phone-number.component.html',
  styleUrls: ['./change-phone-number.component.css']
})
export class ChangePhoneNumberComponent implements OnInit {

  @ViewChild('content') modal;
  selectedCountryCode: string;
  phoneNumber: string;

  countryCodes = [
    'af', 'al', 'dz', 'as', 'ad', 'ao', 'ai', 'aq', 'ag', 'ar', 'am', 'aw', 'au', 'at', 'az', 'bs', 'bh', 'bd', 'bb', 'by', 'be', 'bz',
    'bj', 'bm', 'bt', 'bo', 'ba', 'bw', 'bv', 'br', 'io', 'bn', 'bn', 'bg', 'bf', 'bi', 'kh', 'cm', 'ca', 'cv', 'ky', 'cf', 'td', 'cl',
    'cn', 'cx', 'cc', 'co', 'km', 'cg', 'ck', 'cr', 'ci', 'ci', 'hr', 'cu', 'cy', 'cz', 'dk', 'dj', 'dm', 'do', 'ec', 'eg', 'sv', 'gq',
    'er', 'ee', 'et', 'fk', 'fo', 'fj', 'fi', 'fr', 'gf', 'pf', 'tf', 'ga', 'gm', 'ge', 'de', 'gh', 'gi', 'gr', 'gl', 'gd', 'gp', 'gu',
    'gt', 'gg', 'gn', 'gw', 'gy', 'ht', 'hm', 'va', 'hn', 'hk', 'hu', 'is', 'in', 'id', 'iq', 'ie', 'im', 'il', 'it', 'jm', 'jp', 'je',
    'jo', 'kz', 'ke', 'ki', 'kr', 'kw', 'kg', 'la', 'lv', 'lb', 'ls', 'lr', 'ly', 'ly', 'li', 'lt', 'lu', 'mo', 'mg', 'mw', 'my', 'mv',
    'ml', 'mt', 'mh', 'mq', 'mr', 'mu', 'yt', 'mx', 'mc', 'mn', 'me', 'ms', 'ma', 'mz', 'mm', 'mm', 'na', 'nr', 'np', 'nl', 'an', 'nc',
    'nz', 'ni', 'ne', 'ng', 'nu', 'nf', 'mp', 'no', 'om', 'pk', 'pw', 'pa', 'pg', 'py', 'pe', 'ph', 'pn', 'pl', 'pt', 'pr', 'qa', 're',
    'ro', 'ru', 'ru', 'rw', 'kn', 'lc', 'pm', 'vc', 'vc', 'vc', 'ws', 'sm', 'st', 'sa', 'sn', 'rs', 'sc', 'sl', 'sg', 'sk', 'si', 'sb',
    'so', 'za', 'gs', 'es', 'lk', 'sd', 'sr', 'sj', 'sz', 'se', 'ch', 'sy', 'tw', 'tj', 'th', 'tl', 'tg', 'tk', 'to', 'tt', 'tt', 'tn',
    'tr', 'tm', 'tc', 'tv', 'ug', 'ua', 'ae', 'gb', 'us', 'um', 'uy', 'uz', 'vu', 've', 'vn', 'vn', 'us', 'wf', 'eh', 'ye', 'zm', 'zw'
  ];

  constructor(
    private popupService: PopupService,
    private errorService: ErrorService,
    private router: Router,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.selectedCountryCode = 'af';
    this.popupService.open(this.modal);
  }

  clientValidation(): boolean {
    if (!this.phoneNumber || (this.phoneNumber && this.phoneNumber === '')) {
      this.errorService.handleError(null, 'Please enter your phone number.');
      return false;
    }
    return true;
  }

  verify() {
    if (this.clientValidation()) {
      this.sharedService.showModalOverview();
      this.popupService.close().then(() => {
        setTimeout(() => {
          this.router.navigate(['/settings/profile', {outlets: {popup: ['verify-phone-number', this.phoneNumber]}}]);
        }, 50);
      });
    }
  }

}
