import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NotFoundComponent} from './shared/not-found/not-found.component';
import {ErrorPageComponent} from './shared/error-page/error-page.component';
import {RegisterComponent} from './authorization/register/register.component'
import { SecureInnerPagesGuard } from "./shared/guard/secure-inner-pages.guard";
import {LoginComponent} from './authorization/login/login.component'
import { CanActivate } from '@angular/router/src/utils/preactivation';
import { AuthGuard } from './shared/guard/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: './authorization/authorization.module#AuthorizationModule'
  },
  {
    path: 'dashboard',
    loadChildren: './dashboard/dashboard.module#DashboardModule',
    canActivate: [AuthGuard],
  },  
  {
    path: 'settings',
    loadChildren: './settings/settings.module#SettingsModule',
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: '/settings',
    pathMatch: 'full',
    canActivate: [AuthGuard],
  },
  {
    path: '404',
    component: NotFoundComponent
  },
  {
    path: 'error',
    component: ErrorPageComponent
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];

// const routes: Routes = [
//   {
//     path: 'login',
//     loadChildren: './authorization/authorization.module#AuthorizationModule'
//   },
//   {
//     path: 'dashboard',
//     loadChildren: './dashboard/dashboard.module#DashboardModule'
//   },
//   {
//     path: 'wallet',
//     loadChildren: './wallet/wallet.module#WalletModule'
//   },
//   {
//     path: 'settings',
//     loadChildren: './settings/settings.module#SettingsModule'
//   },
//   {
//     path: '',
//     redirectTo: '/wallet/overview',
//     pathMatch: 'full'
//   },
//   {
//     path: '404',
//     component: NotFoundComponent
//   },
//   {
//     path: 'error',
//     component: ErrorPageComponent
//   },
//   {
//     path: '**',
//     redirectTo: '/404'
//   }
// ];

// const routes: Routes = [
//   {
//     path: 'login',
//     loadChildren: './authorization/authorization.module#AuthorizationModule'    
//   },  
//   {
//     path: 'dashboard',
//     loadChildren: './dashboard/dashboard.module#DashboardModule',
//     canActivate: [AuthGuard],
//   },
//   {
//     path: 'settings',
//     loadChildren: './settings/settings.module#SettingsModule',
//     canActivate: [AuthGuard],
//   },
//   {
//     path: '',
//     redirectTo: '/login',
//     pathMatch: 'full'
//   },  
//   {
//     path: '404',
//     component: NotFoundComponent
//   },
//   {
//     path: 'error',
//     component: ErrorPageComponent
//   },
//   {
//     path: '**',
//     redirectTo: '/404'
//   }
// ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
