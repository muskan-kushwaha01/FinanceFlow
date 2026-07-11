import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginModel } from '../models/login.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://localhost:7144/api/Users';

  constructor(private http: HttpClient) {}

  login(loginData: LoginModel): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, loginData);
  }
}