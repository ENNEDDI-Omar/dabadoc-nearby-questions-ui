import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question } from '../models/question';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = `${environment.apiUrl}/api/v1/questions`;

  constructor(private http: HttpClient) { }


  getQuestions(lat?: number, lng?: number, distance?: number): Observable<Question[]> {
    let url = this.apiUrl;
    if (lat && lng) {
      url += `?lat=${lat}&lng=${lng}`;
      if (distance) {
        url += `&distance=${distance}`;
      }
    }
    return this.http.get<Question[]>(url);
  }


  getQuestion(id: string): Observable<Question> {
    return this.http.get<Question>(`${this.apiUrl}/${id}`);
  }


  createQuestion(question: Question): Observable<Question> {
    return this.http.post<Question>(this.apiUrl, { question });
  }


  updateQuestion(id: string, question: Question): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/${id}`, { question });
  }


  deleteQuestion(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }


  addToFavorites(questionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${questionId}/favorites`, {});
  }


  removeFromFavorites(questionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${questionId}/favorites`);
  }


  getFavorites(): Observable<Question[]> {
    return this.http.get<Question[]>(`${environment.apiUrl}/api/v1/favorites`);
  }
}
