import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';

import { routes } from './app.routes';
import {authInterceptor} from "./interceptors/auth.interceptor";
import {QuestionService} from "./services/question.service";
import {AnswerService} from "./services/answer.service";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    QuestionService,
    AnswerService
  ]
};
