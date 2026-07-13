import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense } from '../models/expense';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private apiUrl = 'https://localhost:7144/api/Expenses';

  constructor(private http: HttpClient) {}

  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.apiUrl);
  }

  getExpense(id:number): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`);
  }

  addExpense(expense:any): Observable<any> {
    return this.http.post(this.apiUrl, expense);
  }

  updateExpense(id:number, expense:any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, expense);
  }

  deleteExpense(id:number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}