import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question } from '../models/question';
import { environment } from '../../environments/environment';
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = `${environment.apiUrl}/questions`;

  constructor(private http: HttpClient) { }



  getQuestions(lat?: number, lng?: number, radius?: number): Observable<Question[]> {
    let url = this.apiUrl;
    let params = new HttpParams();

    if (lat && lng) {
      params = params.set('lat', lat.toString());
      params = params.set('lng', lng.toString());
      if (radius) {
        params = params.set('distance', radius.toString());
      }
    }

    return this.http.get<any[]>(url, { params }).pipe(
        map(response => {
          return response.map(item => {
            return {
              id: item._id || item.id,
              _id: item._id,
              title: item.title,
              content: item.content,
              location: item.location || {
                type: 'Point',
                coordinates: [0, 0]
              },
              user_id: item.user_id,
              created_at: item.created_at,
              updated_at: item.updated_at,
              user: item.user || {
                id: item.user_id || '',
                name: 'User-' + (item.user_id ? item.user_id.substring(0, 5) : 'Anonymous'),
                email: ''
              },
              distance: item.distance,
              answers_count: item.answers_count || 0,
              favorites_count: item.favorites_count || 0
            } as Question;
          });
        })
    );
  }


  getQuestion(id: string): Observable<Question> {
    return this.http.get<Question>(`${this.apiUrl}/${id}`);
  }


  createQuestion(question: Question): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/`, { question });
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
    return this.http.get<Question[]>(`${this.apiUrl}/favorites`);
  }
}
