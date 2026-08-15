import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent implements OnInit {

  darkMode = false;
  notifications = true;

  constructor(private router: Router) {}

  ngOnInit(): void {

    // Load saved Dark Mode
    this.darkMode = localStorage.getItem('darkMode') === 'true';

    // Load saved Notifications
    const savedNotifications = localStorage.getItem('notifications');

    if (savedNotifications !== null) {
      this.notifications = savedNotifications === 'true';
    }

    // Apply saved theme
    this.applyTheme();
  }

  // =========================
  // Profile
  // =========================

  goToProfile(): void {
    this.router.navigate(['/app/profile']);
  }

  // =========================
  // Dark Mode
  // =========================

  toggleDarkMode(): void {

    this.darkMode = !this.darkMode;

    localStorage.setItem(
      'darkMode',
      this.darkMode.toString()
    );

    this.applyTheme();
  }

  applyTheme(): void {

    if (this.darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }

  }

  // =========================
  // Notifications
  // =========================

  toggleNotifications(): void {

    this.notifications = !this.notifications;

    localStorage.setItem(
      'notifications',
      this.notifications.toString()
    );
  }

  // =========================
  // Logout
  // =========================

  logout(): void {

  // Clear login/session data
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('fullName');
  localStorage.removeItem('email');

  // Clear saved preferences if you want a fresh session
  localStorage.removeItem('darkMode');
  localStorage.removeItem('notifications');

  // Remove dark theme
  document.body.classList.remove('dark-theme');

  // Go back to login
  this.router.navigate(['/login']);
}
}