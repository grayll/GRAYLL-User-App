import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NotFoundComponent} from './shared/not-found/not-found.component';
import {ErrorPageComponent} from './shared/error-page/error-page.component';
import {RegisterComponent} from './authorization/register/register.component'
import { SecureInnerPagesGuard } from "./shared/guard/secure-inner-pages.guard";
import {LoginComponent} from './authorization/login/login.component'
import { CanActivate } from '@angular/router/src/utils/preactivation';
import { AuthGuard } from './shared/guard/auth.guard';
import { SwUpdateNotifiyComponent } from './shared/sw-update-notifiy/sw-update-notifiy.component';

const routes: Routes = [
  // {
  //   path: 'login',
  //   loadChildren: './authorization/authorization.module#AuthorizationModule'
  // },
  {
    path: '',
    //redirectTo: '/login',
    loadChildren: './authorization/authorization.module#AuthorizationModule',
    //pathMatch: 'full',
    //canActivate: [AuthGuard],
  },  
  {
    path: 'dashboard',
    loadChildren: './dashboard/dashboard.module#DashboardModule',
    canActivate: [AuthGuard],
  },
  {
    path: 'system',
    loadChildren: './system/system.module#SystemModule',
    canActivate: [AuthGuard],
  },
  {
    path: 'wallet',
    loadChildren: './wallet/wallet.module#WalletModule',
    canActivate: [AuthGuard],
  },
  {
    path: 'data',
    loadChildren: './data/data.module#DataModule',
    canActivate: [AuthGuard],
  },
  {
    path: 'notifications',
    loadChildren: './notifications/notifications.module#NotificationsModule',
    canActivate: [AuthGuard],
  },
  {
    path: 'settings',
    loadChildren: './settings/settings.module#SettingsModule',
    canActivate: [AuthGuard],
  },
  
  {
    path: 'dashboard',
    redirectTo: '/dashboard/overview',
    pathMatch: 'full',
    canActivate: [AuthGuard],
  },
  {
    path: 'referral',
    loadChildren: './referral/referral.module#ReferralModule',
    canActivate: [AuthGuard],
  },
  {
    path: 'swnotify',
    component: SwUpdateNotifiyComponent,   
  },
  {
    path: '404',
    component: NotFoundComponent
  },
  {
    path: 'error',
    component: ErrorPageComponent
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
  {
    path: '**',
    redirectTo: '/404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
