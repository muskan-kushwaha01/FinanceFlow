import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {

  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  register() {

    if (this.password !== this.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const registerData = {
      fullName: this.fullName,
      email: this.email,
      password: this.password
    };

    this.authService.register(registerData).subscribe({

      next: () => {

        // Automatically log in after successful registration
        const loginData = {
          email: this.email,
          password: this.password
        };

        this.authService.login(loginData).subscribe({

          next: (response: any) => {

            // Store JWT Token
            localStorage.setItem("token", response.access_token);
            localStorage.setItem("userId", response.userId.toString());
            localStorage.setItem("fullName", response.fullName);
            localStorage.setItem("email", response.email);

            alert("Registration Successful!");

this.router.navigate(['/app/dashboard']); 
          },

          error: (err: any) => {
            alert(err.error.message);
          }

        });

      },

      error: (err: any) => {
        alert(err.error.message);
      }

    });

  }

}