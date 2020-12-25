import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import {NgbTimeStruct} from '@ng-bootstrap/ng-bootstrap';

//const ct = require('countries-and-timezones');
//const timezone = require('isdcode-country-timezone');
import moment from 'moment-timezone';
//import { Moment } from 'moment';

//import 'moment-range';
import 'moment/locale/fr';
import 'moment/locale/es';
import 'moment/locale/de';
import 'moment/locale/en-gb';
import 'moment/locale/ar';
import 'moment/locale/hi';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/shared/services/auth.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { environment } from 'src/environments/environment';
import { SnotifyService } from 'ng-snotify';

export interface ReportSetting { Frequency?:string; TimeZone?: string; TimeHour?:number;TimeMinute?:number; 
  WalletBalance?:boolean; AccountValue?:boolean; AccountProfit?:boolean;OpenPosition?:boolean;}

@Component({
  selector: 'app-data-settings',
  templateUrl: './data-settings.component.html',
  styleUrls: ['./data-settings.component.css']
})

export class DataSettingsComponent implements OnInit, OnDestroy {

  isChanged:boolean = false
  reportTime: NgbTimeStruct;
  countries = ['Afghanistan', 'Albania', 'Algeria', 'American Samoa', 'Andorra', 'Angola', 'Anguilla', 'Antarctica', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Bosnia and Herzegowina', 'Botswana', 'Bouvet Island', 'Brazil', 'British Indian Ocean Territory', 'Brunei Darussalam', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Cayman Islands', 'Central African Republic', 'Chad', 'Chile', 'China', 'Christmas Island', 'Cocos (Keeling) Islands', 'Colombia', 'Comoros', 'Congo', 'Congo, the Democratic Republic of the', 'Cook Islands', 'Costa Rica', 'Cote d\'Ivoire', 'Croatia (Hrvatska)', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Falkland Islands (Malvinas)', 'Faroe Islands', 'Fiji', 'Finland', 'France', 'France Metropolitan', 'French Guiana', 'French Polynesia', 'French Southern Territories', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guadeloupe', 'Guam', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Heard and Mc Donald Islands', 'Holy See (Vatican City State)', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran (Islamic Republic of)', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, Democratic People\'s Republic of', 'Korea, Republic of', 'Kuwait', 'Kyrgyzstan', 'Lao, People\'s Democratic Republic', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libyan Arab Jamahiriya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macau', 'Macedonia, The Former Yugoslav Republic of', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Martinique', 'Mauritania', 'Mauritius', 'Mayotte', 'Mexico', 'Micronesia, Federated States of', 'Moldova, Republic of', 'Monaco', 'Mongolia', 'Montserrat', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'Netherlands Antilles', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'Norfolk Island', 'Northern Mariana Islands', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Pitcairn', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Reunion', 'Romania', 'Russian Federation', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia (Slovak Republic)', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Georgia and the South Sandwich Islands', 'Spain', 'Sri Lanka', 'St. Helena', 'St. Pierre and Miquelon', 'Sudan', 'Suriname', 'Svalbard and Jan Mayen Islands', 'Swaziland', 'Sweden', 'Switzerland', 'Syrian Arab Republic', 'Taiwan, Province of China', 'Tajikistan', 'Tanzania, United Republic of', 'Thailand', 'Togo', 'Tokelau', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turks and Caicos Islands', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'United States Minor Outlying Islands', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela', 'Vietnam', 'Virgin Islands (British)', 'Virgin Islands (U.S.)', 'Wallis and Futuna Islands', 'Western Sahara', 'Yemen', 'Yugoslavia', 'Zambia', 'Zimbabwe'];
  timezone = {}
  report : ReportSetting = {Frequency:'None', TimeZone:'Etc/UTC', TimeHour:0, TimeMinute:0, WalletBalance: false, 
    AccountValue: false, AccountProfit: false, OpenPosition: false}

  
    public tzNames: string[];

  public userTz: string;
  public selectedTz: string;
  public utcTz: string;
  public displayTz: string;

  public selectedLocale: string;

  public date: moment.Moment;
  public fromNow: string;

  public a: moment.Moment;
  timeZoneOffet :string = '00:00'
  utcTime :string = '00:00'
  
  constructor(private http: HttpClient, private authService: AuthService,private snotifyService: SnotifyService) { 
    
    this.tzNames = moment.tz.names();  
  }

  getUtcHour(){
    let offsetMinutes = moment.tz(this.report.TimeZone).utcOffset()
    if (offsetMinutes == 0){
      return "00:00"
    }
    
    let utcMinute = offsetMinutes % 60
    let utcHour = 0
    utcHour = this.report.TimeHour  - (offsetMinutes/60>>0)
    if (utcHour < 0){
      utcHour = 24 + utcHour
    }
    // if (offsetMinutes > 0){
    //   utcHour = this.report.TimeHour - (offsetMinutes/60>>0)
    //   if (utcHour < 0){
    //     utcHour = 24 + utcHour
    //   } 
    // } else {
    //   utcHour = this.report.TimeHour  - (offsetMinutes/60>>0)
    //   if (utcHour < 0){
    //     utcHour = 24 + utcHour
    //   } 
    // }
    if (offsetMinutes > 0){
      this.utcTime = utcHour.toString().padStart(2, '0') + ":" + this.report.TimeMinute.toString().padStart(2, '0')
      this.timeZoneOffet = '+' + (offsetMinutes/60>>0).toString().padStart(2, '0') + ":" + '00'
      //this.timeZoneOffet = '+' + (offsetMinutes/60>>0).toString().padStart(2, '0') + ":" + utcMinute.toString().padStart(2, '0')
    } else {
      this.utcTime = utcHour.toString().padStart(2, '0') + ":" + this.report.TimeMinute.toString().padStart(2, '0')
      this.timeZoneOffet = '-' + (0 - (offsetMinutes/60>>0)).toString().padStart(2, '0') + ":" + '00'
      //this.timeZoneOffet = '-' + (0 - (offsetMinutes/60>>0)).toString().padStart(2, '0') + ":" + utcMinute.toString().padStart(2, '0')
    }
    
    return this.utcTime

  }

  ngOnInit() {
    if (this.authService.userData.ReportSetting){
      this.report = this.authService.userData.ReportSetting
      this.reportTime = {hour: this.report.TimeHour, minute: this.report.TimeMinute, second: 0};
      this.selectedTz = this.report.TimeZone
    } else {
      this.selectedTz = 'Etc/UTC'
    }  
    this.getUtcHour()
    this.reportTime = {hour: this.report.TimeHour, minute: this.report.TimeMinute, second: 0};
    //console.log('ngOnInit:', this.report)
    
  }
 
  choose(data){   
    this.isChanged = true
  }
  check(dataType){
    this.isChanged = true
  }
  public timeZoneChanged(timeZone: string): void {
    //console.log(timeZone);
    this.report.TimeZone = timeZone;
    //this.timeZoneOffet = moment.tz(this.report.TimeZone).utcOffset()/60 + ":" + "00"
    this.getUtcHour()
    this.isChanged = true
    
  }

  // public testReport(){
  //   this.http.post(`api/v1/reportData`, {UserId: this.authService.userInfo.Uid, Time:1588911048}).subscribe(res => { 
  //     console.log(res)       
  //     if ((res as any).errCode === environment.SUCCESS ) {
  //       this.authService.userData.ReportSetting = this.reportTime
  //     } else {
        
  //     }
  //   },
  //   err => {
  //     //this.snotifyService.simple(`The profile could not be updated! Please retry.`);
  //   })   
  // }

  @HostListener('window:beforeunload')
  ngOnDestroy():void {
    if (this.isChanged){
      //this.report.TimeZone = this.selectedTz
      this.report.TimeHour = this.reportTime.hour
      this.report.TimeMinute = this.reportTime.minute
      //console.log(this.report)
      this.http.post(`api/v1/users/saveReportSetting`, this.report).subscribe(res => { 
        //console.log(res)       
        if ((res as any).errCode === environment.SUCCESS ) {
          this.authService.userData.ReportSetting = this.report
        } else {
          this.snotifyService.simple('The data report setting could not be saved! Please retry.');
        }        
      },
      err => {
        this.snotifyService.simple('The data report setting could not be saved! Please retry.');
      }) 
    }
    // setTimeout(() => {
    //   this.testReport()
    // }, 1000);
  }


}
