// src/app/components/favorites/favorites-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { QuestionService } from '../../../services/question.service';
import { Question } from '../../../models/question';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites-list.component.html',
  styleUrls: ['./favorites-list.component.css']
})
export class FavoritesListComponent implements OnInit {
  favorites: Question[] = [];
  loading = true;
  error = '';

  constructor(private questionService: QuestionService) { }

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;
    this.questionService.getFavorites().subscribe({
      next: (questions) => {
        this.favorites = questions;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
        this.error = 'Unable to load your favorite questions.';
        this.loading = false;
      }
    });
  }

  removeFromFavorites(questionId: string): void {
    this.questionService.removeFromFavorites(questionId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(q => q.id !== questionId);
      },
      error: (error) => {
        console.error('Error removing from favorites:', error);
      }
    });
  }
}
