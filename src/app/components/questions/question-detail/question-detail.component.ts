// question-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuestionService } from '../../../services/question.service';
import { AnswerService } from '../../../services/answer.service';
import { AuthService } from '../../../services/auth.service';
import { Question } from '../../../models/question';
import { Answer } from '../../../models/answer';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-question-detail',
  templateUrl: './question-detail.component.html',
  styleUrls: ['./question-detail.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink]
})
export class QuestionDetailComponent implements OnInit {
  question: Question | null = null;
  answers: Answer[] = [];
  loading = true;
  loadingAnswers = false;
  error = '';
  answerForm: FormGroup;
  isSubmittingAnswer = false;
  answerError = '';
  isFavorite = false;
  isTogglingFavorite = false;
  isLoggedIn = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private questionService: QuestionService,
    private answerService: AnswerService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.answerForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadQuestion();
  }

  loadQuestion(): void {
    const questionId = this.route.snapshot.paramMap.get('id');
    if (!questionId) {
      this.error = 'Question ID is missing';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.questionService.getQuestion(questionId).subscribe(
      (question) => {
        this.question = question;
        this.loading = false;

        // Load answers
        this.loadAnswers(questionId);

        // Check if the question is in the user's favorites
        if (this.isLoggedIn) {
          this.checkIfFavorite(questionId);
        }
      },
      (error) => {
        this.error = 'Error loading question. Please try again.';
        this.loading = false;
        console.error('Error loading question:', error);
      }
    );
  }

  checkIfFavorite(questionId: string): void {
    this.questionService.getFavorites().subscribe(
      (favorites) => {
        this.isFavorite = favorites.some(fav => fav.id === questionId);
      },
      (error) => {
        console.error('Error checking favorites:', error);
      }
    );
  }

  toggleFavorite(): void {
    if (!this.isLoggedIn || !this.question?.id) {
      this.router.navigate(['/login']);
      return;
    }

    this.isTogglingFavorite = true;

    if (this.isFavorite) {
      this.questionService.removeFromFavorites(this.question.id).pipe(
        switchMap(() => {
          this.isFavorite = false;
          return of(null);
        })
      ).subscribe(
        () => { this.isTogglingFavorite = false; },
        (error) => {
          console.error('Error removing from favorites:', error);
          this.isTogglingFavorite = false;
        }
      );
    } else {
      this.questionService.addToFavorites(this.question.id).pipe(
        switchMap(() => {
          this.isFavorite = true;
          return of(null);
        })
      ).subscribe(
        () => { this.isTogglingFavorite = false; },
        (error) => {
          console.error('Error adding to favorites:', error);
          this.isTogglingFavorite = false;
        }
      );
    }
  }

  loadAnswers(questionId: string): void {
    this.loadingAnswers = true;
    this.answerService.getAnswers(questionId).subscribe(
      (answers) => {
        this.answers = answers;
        this.loadingAnswers = false;
      },
      (error) => {
        console.error('Error loading answers:', error);
        this.loadingAnswers = false;
      }
    );
  }

  submitAnswer(): void {
    if (this.answerForm.invalid || !this.question?.id) {
      return;
    }

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.isSubmittingAnswer = true;
    this.answerError = '';

    const answerData = {
      content: this.answerForm.value.content
    };

    this.answerService.createAnswer(this.question.id, answerData).subscribe(
      (response) => {
        this.isSubmittingAnswer = false;
        this.answerForm.reset();

        // Reload answers to show the new one
        this.loadAnswers(this.question!.id!);

        // Update the answers count on the question
        if (this.question && typeof this.question.answers_count === 'number') {
          this.question.answers_count += 1;
        }
      },
      (error) => {
        this.isSubmittingAnswer = false;
        this.answerError = error.error?.errors?.join(', ') || 'An error occurred while posting your answer.';
        console.error('Error submitting answer:', error);
      }
    );
  }

  deleteQuestion(): void {
    if (!this.question?.id || !this.isLoggedIn) {
      return;
    }

    if (confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      this.questionService.deleteQuestion(this.question.id).subscribe(
        () => {
          this.router.navigate(['/questions']);
        },
        (error) => {
          console.error('Error deleting question:', error);
          this.error = 'Error deleting question. Please try again.';
        }
      );
    }
  }

  // Check if the logged in user is the author of the question
  isAuthor(): boolean {
    if (!this.isLoggedIn || !this.question?.user) {
      return false;
    }

    // Option 1: Utiliser directement localStorage
    const userString = localStorage.getItem('currentUser');
    if (userString) {
      try {
        const currentUser = JSON.parse(userString);
        return currentUser.id === this.question.user.id;
      } catch (e) {
        console.error('Error parsing user data from localStorage', e);
        return false;
      }
    }
    return false;

    // Option 2 (alternative): Utiliser la propriété currentUserValue
    // const currentUser = this.authService.currentUserValue;
    // return currentUser?.id === this.question.user.id;
  }
}
