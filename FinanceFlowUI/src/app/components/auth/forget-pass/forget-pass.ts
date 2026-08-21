import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './forget-pass.html',
  styleUrl: './forget-pass.css'
})
export class ForgotPasswordComponent {

  email = '';
  newPassword = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  resetPassword() {

    if (!this.email.trim()) {
      alert('Please enter your email address.');
      return;
    }

    if (!this.newPassword) {
      alert('Please enter a new password.');
      return;
    }

    if (this.newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    if (!this.confirmPassword) {
      alert('Please confirm your password.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const resetData = {
      email: this.email.trim(),
      newPassword: this.newPassword
    };

    this.authService.resetPassword(resetData).subscribe({

      next: (response: any) => {

        alert(
          response.message ||
          'Password reset successfully.'
        );

        this.router.navigate(['/']);

      },

      error: (err: any) => {

        alert(
          err.error?.message ||
          'Unable to reset password.'
        );

      }

    });
  }
}