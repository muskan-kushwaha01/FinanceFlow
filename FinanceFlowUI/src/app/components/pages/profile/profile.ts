import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {

  isEditing = false;
  userId = 0;

  user = {
    userId: 0,
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: ''
  };
originalUser: any = {};
showPasswordSection = false;

currentPassword = '';
newPassword = '';
confirmPassword = '';

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {

    const storedUserId = localStorage.getItem('userId');

    if (!storedUserId) {
      console.error('User ID not found');
      return;
    }

    this.userId = Number(storedUserId);

    this.loadProfile();
  }

 loadProfile(): void {

  this.profileService.getProfile(this.userId).subscribe({

    next: (response) => {

      this.user = {
        userId: response.userId,
        fullName: response.fullName || '',
        email: response.email || '',
        phoneNumber: response.phoneNumber || '',
        dateOfBirth: response.dateOfBirth || '',
        gender: response.gender || ''
      };

      // Keep original data for Cancel
      this.originalUser = { ...this.user };

    },

    error: (err) => {
      console.error('Error loading profile:', err);
    }

  });
}

  editProfile(): void {
    this.isEditing = true;
  }

 saveProfile(): void {

  this.profileService
    .updateProfile(this.userId, this.user)
    .subscribe({

      next: () => {

        // Save name locally
        localStorage.setItem(
          'fullName',
          this.user.fullName
        );

        // Turn OFF edit mode
        this.isEditing = false;

        // Show success message
        alert('Profile updated successfully!');

        // Reload profile data
        this.loadProfile();

      },

      error: (err) => {

        console.error('Error updating profile:', err);

        alert('Failed to update profile.');

      }

    });
}
 cancelEdit(): void {

  this.user = { ...this.originalUser };

  this.isEditing = false;
}
getInitials(): string {

  if (!this.user.fullName) {
    return 'U';
  }

  const nameParts = this.user.fullName
    .trim()
    .split(' ');

  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }

  return (
    nameParts[0].charAt(0) +
    nameParts[nameParts.length - 1].charAt(0)
  ).toUpperCase();
}
openPasswordSection(): void {
  this.showPasswordSection = true;
}

cancelPasswordChange(): void {
  this.showPasswordSection = false;
  this.currentPassword = '';
  this.newPassword = '';
  this.confirmPassword = '';
}
changePassword(): void {

  if (!this.currentPassword || !this.newPassword) {
    alert('Please fill all password fields.');
    return;
  }

  if (this.newPassword !== this.confirmPassword) {
    alert('New passwords do not match.');
    return;
  }

  const data = {
    userId: this.userId,
    currentPassword: this.currentPassword,
    newPassword: this.newPassword
  };

  this.profileService.changePassword(data).subscribe({

    next: () => {

      alert('Password changed successfully.');

      this.cancelPasswordChange();
    },

    error: (err) => {

  console.error('Change Password Error:', err);

  alert(
    err.error?.message ||
    `Failed to change password. Status: ${err.status}`
  );

}

  });
}
}