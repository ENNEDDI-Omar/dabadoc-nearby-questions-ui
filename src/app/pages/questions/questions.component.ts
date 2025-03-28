
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { QuestionListComponent } from '../../components/questions/question-list/question-list.component';
import {HeaderComponent} from "../../shared/layouts/header/header.component";
import {FooterComponent} from "../../shared/layouts/footer/footer.component";

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, QuestionListComponent, HeaderComponent, FooterComponent]
})
export class QuestionsComponent {

}
