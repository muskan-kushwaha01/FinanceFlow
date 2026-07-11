import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  email = '';
  passwordHash = '';

  // 👇 Add this here
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  
  ) {}

  // 👇 Add this method
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {

    const loginData = {
      email: this.email,
      passwordHash: this.passwordHash
    };

    this.authService.login(loginData).subscribe({

      next: (response: any) => {
        this.router.navigate(['/dashboard']);
        console.log(response.user);
      },

      error: (err: any) => {
        alert(err.error.message);
      }

    });

  }

}