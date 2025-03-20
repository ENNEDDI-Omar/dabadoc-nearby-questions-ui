import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

// Définir des interfaces pour les modèles
export interface User {
  id?: string;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private jwtHelper = new JwtHelperService();

  // BehaviorSubject pour stocker et observer l'état de l'utilisateur actuel
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient) {
    // Initialiser avec l'utilisateur stocké dans localStorage si disponible
    const storedUser = this.getUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  // Récupérer l'utilisateur actuel
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Connexion
  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          // Extraire le token du header Authorization
          const authHeader = response.headers?.get('Authorization');
          if (authHeader) {
            const token = authHeader.split(' ')[1]; // Format: 'Bearer TOKEN'
            this.storeToken(token);
          }

          // Stocker les informations utilisateur
          const user = response.data?.user;
          if (user) {
            this.storeUser(user);
            this.currentUserSubject.next(user);
          }
        }),
        map(response => response.data?.user),
        catchError(error => {
          console.error('Login error', error);
          return throwError(() => new Error(error.error?.status?.message || 'Login failed'));
        })
      );
  }

  // Inscription
  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/signup`, userData)
      .pipe(
        tap(response => {
          // Si l'inscription réussit automatiquement la connexion
          const authHeader = response.headers?.get('Authorization');
          if (authHeader) {
            const token = authHeader.split(' ')[1];
            this.storeToken(token);
          }

          const user = response.data?.user;
          if (user) {
            this.storeUser(user);
            this.currentUserSubject.next(user);
          }
        }),
        map(response => response.data?.user),
        catchError(error => {
          console.error('Registration error', error);
          return throwError(() => new Error(error.error?.status?.message || 'Registration failed'));
        })
      );
  }

  // Déconnexion
  logout(): void {
    // Nettoyer le localStorage et réinitialiser l'utilisateur actuel
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);

    // Optionnel: appeler l'API pour invalider le token côté serveur
    this.http.delete(`${this.apiUrl}/logout`).subscribe({
      error: error => console.error('Logout error', error)
    });
  }

  // Vérifier si l'utilisateur est connecté
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  // Obtenir le token JWT
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Stocker le token JWT
  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Stocker les informations utilisateur
  private storeUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Récupérer l'utilisateur depuis le localStorage
  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Récupérer l'emplacement actuel de l'utilisateur
  getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  }
}
