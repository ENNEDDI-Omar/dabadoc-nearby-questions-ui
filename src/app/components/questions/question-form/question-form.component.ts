import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuestionService } from '../../../services/question.service';
import { Question } from '../../../models/question';

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class QuestionFormComponent implements OnInit {
  questionForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  userLocation: { latitude: number, longitude: number } | null = null;

  constructor(
    private fb: FormBuilder,
    private questionService: QuestionService,
    private router: Router
  ) {
    this.questionForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.getUserLocation();
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        },
        (error) => {
          console.error('Error getting location:', error);
          this.errorMessage = 'Unable to get your location. Please enable location services.';
        }
      );
    } else {
      this.errorMessage = 'Geolocation is not supported by this browser.';
    }
  }

  onSubmit() {
    if (this.questionForm.invalid || !this.userLocation) {
      return;
    }

    this.isSubmitting = true;


    const locationGeoJSON = {
      type: 'Point',
      coordinates: [this.userLocation.longitude, this.userLocation.latitude]
    };

    const questionData = {
      title: this.questionForm.value.title,
      content: this.questionForm.value.content,
      location: {
        latitude: this.userLocation.latitude,
        longitude: this.userLocation.longitude
      }
    };

    this.questionService.createQuestion(questionData).subscribe(
        (response) => {
          this.isSubmitting = false;
          this.router.navigate(['/questions']);
        },
        (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.error?.errors?.join(', ') || 'An error occurred while posting your question.';
        }
    );
  }
}
