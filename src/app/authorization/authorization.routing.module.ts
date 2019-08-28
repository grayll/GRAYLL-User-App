import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import {LoginComponent} from './login/login.component';
import {TwoFactorComponent} from './two-factor/two-factor.component';
import {RegisterComponent} from './register/register.component';
import {NewPasswordComponent} from './new-password/new-password.component';
import { HandleComponent } from './handle/handle.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'two-factor',
    component: TwoFactorComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'new-password',
    component: NewPasswordComponent
  },
  {
    path: 'handle',
    component: HandleComponent
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)]
})
export class AuthorizationRoutingModule { }
