import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { DashboardSummary } from '../models/dashboard-summary';
import { RecentTransaction } from '../models/recent-transaction';
import { ExpenseCategory } from '../models/expense-category';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  // Change this to your API port
  private apiUrl = 'https://localhost:7144/api/Dashboard';

  constructor(private http: HttpClient) { }

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/summary`);
  }

  getRecentTransactions(): Observable<RecentTransaction[]> {
    return this.http.get<RecentTransaction[]>(`${this.apiUrl}/recent-transactions`);
  }

  getExpenseByCategory(): Observable<ExpenseCategory[]> {
    return this.http.get<ExpenseCategory[]>(`${this.apiUrl}/expense-by-category`);
  }

}