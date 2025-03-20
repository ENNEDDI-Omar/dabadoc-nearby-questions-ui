import { Routes } from '@angular/router';
import {SignupComponent} from "./components/signup/signup.component";
import {LoginComponent} from "./components/login/login.component";
import {HomeComponent} from "./pages/home/home.component";

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  // { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  // { path: 'questions/new', component: QuestionFormComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
