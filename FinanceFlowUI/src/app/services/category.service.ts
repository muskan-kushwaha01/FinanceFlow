import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiUrl = "https://localhost:7144/api/Categories";

  constructor(private http: HttpClient) { }

  getIncomeCategories(): Observable<Category[]> {

    return this.http.get<Category[]>(
      `${this.apiUrl}?type=Income`
    );

  }

}