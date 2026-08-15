import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

interface Notification {
  id: number;
  title: string;
  message: string;
  icon: string;
  time: string;
  read: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {

  userName = localStorage.getItem('fullName') || 'User';

  userInitial = this.userName
    .charAt(0)
    .toUpperCase();

  notificationOpen = false;

  notifications: Notification[] = [
    {
      id: 1,
      title: 'Budget Alert',
      message: 'Your food budget is almost used.',
      icon: 'warning',
      time: '10 min ago',
      read: false
    },
    {
      id: 2,
      title: 'Subscription Reminder',
      message: 'Your Netflix payment is due soon.',
      icon: 'subscriptions',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      title: 'Monthly Summary',
      message: 'Your monthly financial report is ready.',
      icon: 'bar_chart',
      time: 'Yesterday',
      read: true
    }
  ];

  toggleNotifications(): void {
    this.notificationOpen = !this.notificationOpen;
  }

  get unreadCount(): number {
    return this.notifications.filter(
      notification => !notification.read
    ).length;
  }

  markAsRead(notification: Notification): void {
    notification.read = true;
  }

  markAllAsRead(): void {
    this.notifications.forEach(
      notification => notification.read = true
    );
  }

  closeNotifications(): void {
    this.notificationOpen = false;
  }
}