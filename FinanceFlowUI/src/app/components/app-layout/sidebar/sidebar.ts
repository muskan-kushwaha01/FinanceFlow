import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {

  userName = localStorage.getItem('fullName') || 'Muskan';
  userInitial = this.userName.charAt(0).toUpperCase();

  constructor(private router: Router) {}

  logout(): void {

    localStorage.clear();

    this.router.navigate(['/login']);

  }

}