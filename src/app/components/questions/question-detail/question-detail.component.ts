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
  editingAnswerId: string | null = null;
  editAnswerForm: FormGroup;
  isSubmittingEdit = false;

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
    this.editAnswerForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadQuestion();
  }

  // Méthode utilitaire pour obtenir l'ID d'un objet (question ou réponse)
  getObjectId(obj: any): string | undefined {
    return obj?.id || obj?._id;
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

          this.loadAnswers(questionId);

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
          this.isFavorite = favorites.some(fav => this.getObjectId(fav) === questionId);
        },
        (error) => {
          console.error('Error checking favorites:', error);
          this.isFavorite = false;
        }
    );
  }

  toggleFavorite(): void {
    const questionId = this.getObjectId(this.question);
    if (!this.isLoggedIn || !questionId) {
      this.router.navigate(['/login']);
      return;
    }

    this.isTogglingFavorite = true;

    if (this.isFavorite) {
      this.questionService.removeFromFavorites(questionId).pipe(
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
      this.questionService.addToFavorites(questionId).pipe(
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
    console.log('Submit Answer method called');
    console.log('Form validity:', this.answerForm.valid);
    console.log('Form values:', this.answerForm.value);
    console.log('Question object:', this.question);

    const questionId = this.getObjectId(this.question);

    if (this.answerForm.invalid || !questionId) {
      console.log('Form is invalid or question ID is missing');
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

    this.answerService.createAnswer(questionId, answerData).subscribe(
        (response) => {
          console.log('Response from server:', response);
          this.isSubmittingAnswer = false;
          this.answerForm.reset();

          this.loadAnswers(questionId);

          if (this.question && typeof this.question.answers_count === 'number') {
            this.question.answers_count += 1;
          }
        },
        (error) => {
          console.error('Error submitting answer:', error);
          this.isSubmittingAnswer = false;
          this.answerError = error.error?.errors?.join(', ') || 'An error occurred while posting your answer.';
        }
    );
  }

  startEditingAnswer(answer: Answer): void {

    const answerId = this.getObjectId(answer);
    if (!answerId) {
      console.error("No answer ID found for editing");
      return;
    }

    this.editingAnswerId = answerId;
    this.editAnswerForm.patchValue({
      content: answer.content
    });
  }

  // Méthode pour annuler l'édition d'une réponse
  cancelEditingAnswer(): void {
    this.editingAnswerId = null;
    this.editAnswerForm.reset();
  }

  // Méthode pour soumettre la modification d'une réponse
  updateAnswer(answerId: string): void {
    if (!answerId) {
      console.error("No answer ID provided for update");
      return;
    }

    const questionId = this.getObjectId(this.question);
    if (this.editAnswerForm.invalid || !questionId) {
      console.error("Invalid form or missing question ID");
      return;
    }

    console.log("Updating answer:", answerId, "for question:", questionId);

    this.isSubmittingEdit = true;
    const answerData = {
      content: this.editAnswerForm.value.content
    };

    this.answerService.updateAnswer(questionId, answerId, answerData).subscribe(
        (updatedAnswer) => {
          console.log("Answer updated successfully:", updatedAnswer);
          this.isSubmittingEdit = false;
          this.editingAnswerId = null;

          // Mettre à jour la réponse dans la liste locale
          const index = this.answers.findIndex(a => this.getObjectId(a) === answerId);
          if (index !== -1) {
            this.answers[index] = updatedAnswer;
          }
        },
        (error) => {
          console.error('Error updating answer:', error);
          this.isSubmittingEdit = false;
          this.answerError = error.error?.errors?.join(', ') || 'An error occurred while updating your answer.';
        }
    );
  }

  deleteQuestion(): void {
    const questionId = this.getObjectId(this.question);
    if (!questionId || !this.isLoggedIn) {
      return;
    }

    if (confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      this.questionService.deleteQuestion(questionId).subscribe(
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

  // Dans question-detail.component.ts
  deleteAnswer(answerId: string | undefined): void {
    if (!answerId) {
      console.error("No answer ID provided");
      return;
    }

    const questionId = this.getObjectId(this.question);
    if (!questionId) {
      console.error("No question ID found");
      return;
    }

    console.log("Deleting answer:", answerId, "for question:", questionId);

    if (confirm('Are you sure you want to delete this answer?')) {
      this.answerService.deleteAnswer(questionId, answerId).subscribe(
          () => {
            // Retirer la réponse de la liste locale
            this.answers = this.answers.filter(a => this.getObjectId(a) !== answerId);

            // Mettre à jour le compteur de réponses de la question
            if (this.question && typeof this.question.answers_count === 'number') {
              this.question.answers_count -= 1;
            }
          },
          (error) => {
            console.error('Error deleting answer:', error);
            this.answerError = 'Failed to delete answer. Please try again.';
          }
      );
    }
  }

  // Check if the logged in user is the author of the question
  isAuthor(): boolean {
    if (!this.isLoggedIn || !this.question?.user) {
      return false;
    }

    const userString = localStorage.getItem('currentUser');
    if (userString) {
      try {
        const currentUser = JSON.parse(userString);
        return currentUser.id === this.getObjectId(this.question.user);
      } catch (e) {
        console.error('Error parsing user data from localStorage', e);
        return false;
      }
    }
    return false;
  }

  isAnswerAuthor(answer: Answer): boolean {
    if (!this.isLoggedIn || !answer.user) {
      return false;
    }

    const userString = localStorage.getItem('currentUser');
    if (userString) {
      try {
        const currentUser = JSON.parse(userString);
        return currentUser.id === this.getObjectId(answer.user);
      } catch (e) {
        console.error('Error parsing user data from localStorage', e);
        return false;
      }
    }
    return false;
  }

  // Formatter une date pour l'affichage
  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleString();
  }
}
