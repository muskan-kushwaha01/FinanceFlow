import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private apiUrl = 'https://localhost:7144/api/Users';

  constructor(private http: HttpClient) {}

  getProfile(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/${userId}`);
  }

  updateProfile(userId: number, profile: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile/${userId}`, profile);
  }
  changePassword(data: any): Observable<any> {
  return this.http.put(
    `${this.apiUrl}/change-password`,
    data
  );
}
}