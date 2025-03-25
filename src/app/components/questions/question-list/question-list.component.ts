import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { QuestionService } from '../../../services/question.service';
import { Question } from '../../../models/question';

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink]
})
export class QuestionListComponent implements OnInit {
  questions: Question[] = [];
  loading = true;
  error = '';
  userLocation: { latitude: number, longitude: number } | null = null;
  searchRadius = 10;
  sortOption = 'distance';

  constructor(private questionService: QuestionService) { }

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
          this.loadQuestions();
        },
        (error) => {
          console.error('Error getting location:', error);
          this.loadQuestions();
          this.loading = false;
          this.error = 'Unable to get your location. Showing all questions.';
        }
      );
    } else {
      this.loadQuestions();
      this.loading = false;
    }
  }

  loadQuestions() {
    this.loading = true;
    if (this.userLocation) {
      this.questionService.getQuestions(
          this.userLocation.latitude,
          this.userLocation.longitude,
          this.searchRadius
      ).subscribe(
          (questionsFromApi) => {
            console.log('Questions from service:', questionsFromApi);
            this.questions = questionsFromApi;
            this.sortQuestions();
            this.loading = false;
          },
          (error) => {
            this.error = 'Error loading questions. Please try again.';
            this.loading = false;
            console.error('Error loading questions:', error);
          }
      );
    } else {
      this.questionService.getQuestions().subscribe(
          (questionsFromApi) => {
            console.log('Questions without location:', questionsFromApi);
            this.questions = questionsFromApi;
            this.loading = false;
          },
          (error) => {
            this.error = 'Error loading questions. Please try again.';
            this.loading = false;
            console.error('Error loading questions:', error);
          }
      );
    }
  }

  updateSearchRadius(radius: number) {
    this.searchRadius = radius;
    if (this.userLocation) {
      this.loadQuestions();
    }
  }

  sortQuestions() {
    if (this.sortOption === 'distance' && this.userLocation) {
      this.questions.sort((a, b) => {
        const distanceA = a.distance || Infinity;
        const distanceB = b.distance || Infinity;
        return distanceA - distanceB;
      });
    } else if (this.sortOption === 'newest') {
      this.questions.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    } else if (this.sortOption === 'mostAnswers') {
      this.questions.sort((a, b) => {
        const answersA = a.answers_count || 0;
        const answersB = b.answers_count || 0;
        return answersB - answersA;
      });
    }
  }

  updateSortOption(option: string) {
    this.sortOption = option;
    this.sortQuestions();
  }


  //getLatitude(question: Question): number {
    //if (question.location?.coordinates?.length >= 2) {
      //return question.location.coordinates[1];
    //}
    //return 0;
  //}

  //getLongitude(question: Question): number {
    //if (question.location?.coordinates?.length >= 1) {
      //return question.location.coordinates[0];
    //}
    //return 0;
  //}

  addToFavorites(questionId: string) {
    this.questionService.addToFavorites(questionId).subscribe(
      () => {
        // Show a success message or update UI
      },
      (error) => {
        console.error('Error adding to favorites:', error);
      }
    );
  }
}
