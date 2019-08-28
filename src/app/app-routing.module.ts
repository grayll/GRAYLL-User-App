import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NotFoundComponent} from './shared/not-found/not-found.component';
import {ErrorPageComponent} from './shared/error-page/error-page.component';
import {RegisterComponent} from './authorization/register/register.component'
import { SecureInnerPagesGuard } from "./shared/guard/secure-inner-pages.guard";
import {LoginComponent} from './authorization/login/login.component'

const routes: Routes = [
  {
    path: 'login',
    loadChildren: './authorization/authorization.module#AuthorizationModule'
    //component: LoginComponent, canActivate: [SecureInnerPagesGuard]
  },
  // {
  //   path: 'register',
  //   component: RegisterComponent,canActivate: [SecureInnerPagesGuard]
    
  // },
  {
    path: 'dashboard',
    loadChildren: './dashboard/dashboard.module#DashboardModule'
  },
  {
    path: 'settings',
    loadChildren: './settings/settings.module#SettingsModule'
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
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

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
