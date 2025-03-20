import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Récupérer le token d'authentification
  const token = authService.getToken();

  // Si nous avons un token, ajoutez-le à l'en-tête de la requête
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Gérer les erreurs d'authentification
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si nous recevons une erreur 401 (Non autorisé), rediriger vers la page de connexion
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
