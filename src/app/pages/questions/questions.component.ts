// pages/questions/questions.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { QuestionListComponent } from '../../components/questions/question-list/question-list.component';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, QuestionListComponent]
})
export class QuestionsComponent {

}
