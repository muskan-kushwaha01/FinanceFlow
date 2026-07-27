import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SavingGoal } from '../models/saving-goal';
import { GoalSummary } from '../models/goal-summary';

@Injectable({
  providedIn: 'root'
})
export class SavingGoalService {

  private apiUrl = 'https://localhost:7144/api/SavingGoals';

  constructor(private http: HttpClient) { }

  getGoals(userId: number): Observable<SavingGoal[]> {
    return this.http.get<SavingGoal[]>(`${this.apiUrl}/${userId}`);
  }

  getSummary(userId: number): Observable<GoalSummary[]> {
    return this.http.get<GoalSummary[]>(`${this.apiUrl}/summary/${userId}`);
  }

  addGoal(goal: SavingGoal): Observable<SavingGoal> {
    return this.http.post<SavingGoal>(this.apiUrl, goal);
  }

  updateGoal(goal: SavingGoal): Observable<SavingGoal> {
    return this.http.put<SavingGoal>(`${this.apiUrl}/${goal.goalId}`, goal);
  }

  deleteGoal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}