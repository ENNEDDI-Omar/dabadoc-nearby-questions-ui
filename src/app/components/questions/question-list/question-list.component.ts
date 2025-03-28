import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { QuestionService } from '../../../services/question.service';
import { Question } from '../../../models/question';
import {AuthService} from "../../../services/auth.service";

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink]
})
export class QuestionListComponent implements OnInit {
  questions: Question[] = [];
  allQuestions: Question[] = [];
  loading = true;
  loadedSome = false;
  error = '';
  userLocation: { latitude: number, longitude: number } | null = null;
  searchRadius = 10;
  sortOption = 'distance';
  favoriteQuestionIds: Set<string> = new Set();
  isLoggedIn = false;

  pagination = {
    currentPage: 1,
    itemsPerPage: 6,
    totalItems: 0
  };

  constructor(
      private questionService: QuestionService,
      private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.getUserLocation();
    if (this.isLoggedIn) {
      this.loadFavorites();
    }
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
    this.loadedSome = false;
    if (this.userLocation) {
      this.questionService.getQuestions(
          this.userLocation.latitude,
          this.userLocation.longitude,
          this.searchRadius
      ).subscribe(
          (questionsFromApi) => {
            console.log('Questions loaded with answers count:', questionsFromApi.map(q => ({id: q.id, title: q.title, answers_count: q.answers_count})));
            this.loadedSome = true;
            this.questions = questionsFromApi;
            this.allQuestions = questionsFromApi;
            this.pagination.totalItems = this.allQuestions.length;
            this.sortQuestions();
            this.applyPagination();
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
            this.allQuestions = questionsFromApi;
            this.pagination.totalItems = this.allQuestions.length;
            this.questions = questionsFromApi;
            this.sortQuestions();
            this.applyPagination();
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
      this.allQuestions.sort((a, b) => {
        const distanceA = a.distance || Infinity;
        const distanceB = b.distance || Infinity;
        return distanceA - distanceB;
      });
    } else if (this.sortOption === 'newest') {
      this.allQuestions.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    } else if (this.sortOption === 'mostAnswers') {
      this.allQuestions.sort((a, b) => {
        const answersA = a.answers_count || 0;
        const answersB = b.answers_count || 0;
        return answersB - answersA;
      });
    }

    // Après le tri, appliquer la pagination
    this.applyPagination();
  }

  // Nouvelle méthode pour paginer les résultats
  applyPagination() {
    const startIndex = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
    const endIndex = startIndex + this.pagination.itemsPerPage;

    // Mettre à jour les questions affichées
    this.questions = this.allQuestions.slice(startIndex, endIndex);
  }

  // Méthode pour changer de page
  changePage(page: number) {
    this.pagination.currentPage = page;
    this.applyPagination();
  }

  // Obtenir le nombre total de pages
  get totalPages(): number {
    return Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
  }

  // Pour la mise à jour du tri
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

      },
      (error) => {
        console.error('Error adding to favorites:', error);
      }
    );
  }

  loadFavorites(): void {
    this.questionService.getFavorites().subscribe({
      next: (favorites) => {
        this.favoriteQuestionIds = new Set(favorites.map(f => f.id || '').filter(id => id !== ''));
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
      }
    });
  }

  isQuestionFavorite(questionId: string): boolean {
    return this.favoriteQuestionIds.has(questionId);
  }

  toggleFavorite(questionId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.isLoggedIn) {
      // Rediriger vers la page de connexion
      // this.router.navigate(['/login']);
      return;
    }

    if (this.isQuestionFavorite(questionId)) {
      this.questionService.removeFromFavorites(questionId).subscribe({
        next: () => {
          this.favoriteQuestionIds.delete(questionId);
        },
        error: (error) => {
          console.error('Error removing from favorites:', error);
        }
      });
    } else {
      this.questionService.addToFavorites(questionId).subscribe({
        next: () => {
          this.favoriteQuestionIds.add(questionId);
        },
        error: (error) => {
          console.error('Error adding to favorites:', error);
        }
      });
    }
  }
}
