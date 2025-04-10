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

  // Get answers for a specific question
  getAnswers(questionId: string): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.apiUrl}/${questionId}/answers`);
  }

  createAnswer(questionId: string, answer: { content: string }): Observable<Answer> {
    console.log('Sending answer to server:', answer);
    console.log('Question ID:', questionId);
    console.log('API URL:', `${this.apiUrl}/${questionId}/answers`);

    return this.http.post<Answer>(`${this.apiUrl}/${questionId}/answers`, { answer });
  }

  updateAnswer(questionId: string, answerId: string, answer: { content: string }): Observable<Answer> {
    return this.http.put<Answer>(`${this.apiUrl}/${questionId}/answers/${answerId}`, { answer });
  }

  deleteAnswer(questionId: string, answerId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${questionId}/answers/${answerId}`);
  }
}
