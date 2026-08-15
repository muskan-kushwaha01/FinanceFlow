import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subscription } from '../models/subscription';
import { SubscriptionSummary } from '../models/subscription-summary';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  private apiUrl = 'https://localhost:7144/api/Subscriptions';

  constructor(private http: HttpClient) { }

  getSubscriptions(userId: number): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.apiUrl}/user/${userId}`);
  }

  getSummary(userId: number): Observable<SubscriptionSummary> {
    return this.http.get<SubscriptionSummary>(`${this.apiUrl}/summary/${userId}`);
  }

  addSubscription(subscription: Subscription): Observable<any> {
  return this.http.post(this.apiUrl, subscription);
}

updateSubscription(id: number, subscription: Subscription): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}`, subscription);
}

  deleteSubscription(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  processRenewals(userId: number): Observable<any> {
  return this.http.post(
    `${this.apiUrl}/process-renewals/${userId}`,
    {}
  );
}
}