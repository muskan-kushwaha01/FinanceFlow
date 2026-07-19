import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  email = '';
  password = '';

  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {

    const loginData = {
      email: this.email,
      password: this.password
    };

    this.authService.login(loginData).subscribe({

      next: (response: any) => {

  // Save JWT Token
  localStorage.setItem("token", response.access_token);

  // Save logged-in user details
  localStorage.setItem("userId", response.userId.toString());
  localStorage.setItem("fullName", response.fullName);
  localStorage.setItem("email", response.email);

  console.log(response);

  // Navigate to Dashboard
this.router.navigate(['/app/dashboard']);
},

      error: (err: any) => {

        alert(err.error.message);

      }

    });

  }

}