// src/app/components/signup/signup.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  loading = false;
  errorMessage = '';
  locationLoading = false;
  locationError = '';
  userLocation: { latitude: number, longitude: number } | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', Validators.required],
      useLocation: [true]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.getUserLocation();
  }

  // Validateur personnalisé pour vérifier si les mots de passe correspondent
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const passwordConfirm = group.get('password_confirmation')?.value;
    return password === passwordConfirm ? null : { mismatch: true };
  }

  getUserLocation() {
    if (!this.signupForm.get('useLocation')?.value) {
      return;
    }

    this.locationLoading = true;
    this.locationError = '';

    this.authService.getCurrentLocation()
      .then(position => {
        this.userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        this.locationLoading = false;
      })
      .catch(error => {
        this.locationError = 'Could not get your location. You can still register without location.';
        this.locationLoading = false;
        console.error('Error getting location:', error);
      });
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { name, email, password, password_confirmation, useLocation } = this.signupForm.value;

    // Créer l'objet de base sans la location
    const formData: any = {
      name,
      email,
      password,
      password_confirmation
    };

    // Ajouter la location uniquement si elle est disponible
    if (useLocation && this.userLocation) {
      formData.location = this.userLocation;
    }

    this.authService.register(formData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Registration failed. Please try again.';
      }
    });
  }

  toggleLocation() {
    const useLocation = this.signupForm.get('useLocation')?.value;
    if (useLocation && !this.userLocation) {
      this.getUserLocation();
    }
  }
}
