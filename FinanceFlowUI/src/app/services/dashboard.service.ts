import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { DashboardSummary } from '../models/dashboard-summary';
import { RecentTransaction } from '../models/recent-transaction';
import { ExpenseCategory } from '../models/expense-category';

export interface MonthlyReport {
  month: string;
  monthNumber: number;
  income: number;
  expense: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'https://localhost:7144/api/Dashboard';

  constructor(private http: HttpClient) { }

  getSummary(
    month: number,
    year: number
  ): Observable<DashboardSummary> {

    return this.http.get<DashboardSummary>(
      `${this.apiUrl}/summary?month=${month}&year=${year}`
    );
  }

  getRecentTransactions(
    month: number,
    year: number
  ): Observable<RecentTransaction[]> {

    return this.http.get<RecentTransaction[]>(
      `${this.apiUrl}/recent-transactions?month=${month}&year=${year}`
    );
  }

  getExpenseByCategory(
    month: number,
    year: number
  ): Observable<ExpenseCategory[]> {

    return this.http.get<ExpenseCategory[]>(
      `${this.apiUrl}/expense-by-category?month=${month}&year=${year}`
    );
  }

  getMonthlyReport(
    userId: number,
    year: number
  ): Observable<MonthlyReport[]> {

    return this.http.get<MonthlyReport[]>(
      `https://localhost:7144/api/Reports/monthly/${userId}?year=${year}`
    );
  }

  getBudgetSummary(
    userId: number,
    month: number,
    year: number
  ): Observable<any[]> {

    return this.http.get<any[]>(
      `https://localhost:7144/api/Budgets/summary/${userId}?month=${month}&year=${year}`
    );
  }

}