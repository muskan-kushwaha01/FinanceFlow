import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Income } from '../models/income';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {

private apiUrl = 'https://localhost:7144/api/Incomes';
  constructor(private http: HttpClient) { }

  getIncomes(): Observable<Income[]> {

  const userId = localStorage.getItem("userId");

  return this.http.get<Income[]>(`${this.apiUrl}?userId=${userId}`);

}
  getIncome(id: number): Observable<Income> {
    return this.http.get<Income>(`${this.apiUrl}/${id}`);
  }

  addIncome(income: any): Observable<any> {
    return this.http.post(this.apiUrl, income);
  }

  updateIncome(id: number, income: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, income);
  }

  deleteIncome(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}