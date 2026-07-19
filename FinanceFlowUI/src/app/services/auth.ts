import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginModel } from '../models/login.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userApi = 'https://localhost:7144/api/Users';
  private authApi = 'https://localhost:7144/api/ApplicationOAuthProvider';

  constructor(private http: HttpClient) {}

  // Login
  login(loginData: LoginModel): Observable<any> {
    return this.http.post(`${this.authApi}/login`, loginData);
  }

  // Register
  register(registerData: any): Observable<any> {
    return this.http.post(`${this.userApi}/register`, registerData);
  }

}