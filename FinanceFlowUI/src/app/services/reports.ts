import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReportsSummary {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;

  totalBudget: number;
  budgetUsed: number;
  budgetRemaining: number;

  monthlySubscriptionCost: number;
  yearlySubscriptionCost: number;

  totalSavingsGoalTarget: number;
  totalSavingsGoalSaved: number;
  savingsGoalProgress: number;
}

export interface MonthlyReport {
  month: string;
  monthNumber: number;
  income: number;
  expense: number;
}

export interface ExpenseCategoryReport {
  categoryName: string;
  totalAmount: number;
  percentage: number;
}

export interface BudgetVsActual {
  categoryName: string;
  budgetAmount: number;
  actualAmount: number;
  difference: number;
  percentageUsed: number;
  isOverBudget: boolean;
}

export interface PaymentMethodReport {
  paymentMethod: string;
  totalAmount: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  private apiUrl = 'https://localhost:7144/api/Reports';

  constructor(private http: HttpClient) {}

  getSummary(
    userId: number,
    month: number,
    year: number
  ): Observable<ReportsSummary> {
    return this.http.get<ReportsSummary>(
      `${this.apiUrl}/summary/${userId}?month=${month}&year=${year}`
    );
  }

  getMonthlyReport(
    userId: number,
    year: number
  ): Observable<MonthlyReport[]> {
    return this.http.get<MonthlyReport[]>(
      `${this.apiUrl}/monthly/${userId}?year=${year}`
    );
  }

  getExpenseCategories(
    userId: number,
    month: number,
    year: number
  ): Observable<ExpenseCategoryReport[]> {
    return this.http.get<ExpenseCategoryReport[]>(
      `${this.apiUrl}/expense-categories/${userId}?month=${month}&year=${year}`
    );
  }

  getBudgetVsActual(
    userId: number,
    month: number,
    year: number
  ): Observable<BudgetVsActual[]> {
    return this.http.get<BudgetVsActual[]>(
      `${this.apiUrl}/budget-vs-actual/${userId}?month=${month}&year=${year}`
    );
  }

  getPaymentMethods(
    userId: number,
    month: number,
    year: number
  ): Observable<PaymentMethodReport[]> {
    return this.http.get<PaymentMethodReport[]>(
      `${this.apiUrl}/payment-methods/${userId}?month=${month}&year=${year}`
    );
  }
}