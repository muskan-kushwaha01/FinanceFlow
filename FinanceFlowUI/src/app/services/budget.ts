import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget } from '../models/budget';
import { BudgetSummary } from '../models/budget-summary';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  private apiUrl = 'https://localhost:7144/api/Budgets';

  constructor(private http: HttpClient) { }

  getBudgets(userId: number): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.apiUrl}/user/${userId}`);
  }

  getSummary(userId: number, month: number, year: number): Observable<BudgetSummary[]> {
    return this.http.get<BudgetSummary[]>(
      `${this.apiUrl}/summary/${userId}?month=${month}&year=${year}`
    );
  }

  addBudget(budget: any): Observable<any> {
    return this.http.post(this.apiUrl, budget);
  }

  updateBudget(id: number, budget: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, budget);
  }

  deleteBudget(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}