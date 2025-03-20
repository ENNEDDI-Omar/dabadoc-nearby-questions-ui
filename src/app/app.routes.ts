import { Routes } from '@angular/router';
import {SignupComponent} from "./components/signup/signup.component";
import {LoginComponent} from "./components/login/login.component";
import {HomeComponent} from "./pages/home/home.component";
import {QuestionFormComponent} from "./components/questions/question-form/question-form.component";
import {authGuard} from "./guards/auth.guard";
import {QuestionListComponent} from "./components/questions/question-list/question-list.component";
import {QuestionDetailComponent} from "./components/questions/question-detail/question-detail.component";
import {QuestionsComponent} from "./pages/questions/questions.component";

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  // { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'questions', component: QuestionsComponent },
  { path: 'questions/new', component: QuestionFormComponent, canActivate: [authGuard] },
  { path: 'questions/:id', component: QuestionDetailComponent },

  { path: '**', redirectTo: '' }
];
