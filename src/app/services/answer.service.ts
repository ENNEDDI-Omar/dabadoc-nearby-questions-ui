import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Answer } from '../models/answer';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {
  private apiUrl = `${environment.apiUrl}/questions`;

  constructor(private http: HttpClient) { }


  getAnswers(questionId: string): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.apiUrl}/${questionId}/answers`);
  }

  // Create a new answer for a question
  createAnswer(questionId: string, answer: { content: string }): Observable<Answer> {
    return this.http.post<Answer>(`${this.apiUrl}/${questionId}/answers`, { answer });
  }

  // Update an existing answer
  updateAnswer(questionId: string, answerId: string, answer: { content: string }): Observable<Answer> {
    return this.http.put<Answer>(`${this.apiUrl}/${questionId}/answers/${answerId}`, { answer });
  }

  // Delete an answer
  deleteAnswer(questionId: string, answerId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${questionId}/answers/${answerId}`);
  }
}
