import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { CommonModule,DatePipe  } from '@angular/common';
import { DashboardSummary } from '../../models/dashboard-summary';
import { RecentTransaction } from '../../models/recent-transaction';
import { ExpenseCategory } from '../../models/expense-category';
import Chart from 'chart.js/auto';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  summary: DashboardSummary | null = null;


  recentTransactions: RecentTransaction[] = [];

  expenseCategories: ExpenseCategory[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {

    this.loadSummary();

    this.loadRecentTransactions();

    this.loadExpenseCategories();

  }

  loadSummary() {
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  loadRecentTransactions() {
    this.dashboardService.getRecentTransactions().subscribe({
      next: (data) => {
        this.recentTransactions = data;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  loadExpenseCategories() {

  this.dashboardService.getExpenseByCategory().subscribe({

    next: (data) => {

      this.expenseCategories = data;

      this.createChart();

    },

    error: (err) => {

      console.log(err);

    }

  });

}
  private createChart() {

  const labels = this.expenseCategories.map(x => x.categoryName);

  const amounts = this.expenseCategories.map(x => x.totalAmount);

  new Chart("expenseChart", {

    type: 'pie',

    data: {

      labels: labels,

      datasets: [

        {

          data: amounts

        }

      ]

    },

    options: {

      responsive: true,

      plugins: {

        legend: {

          position: 'bottom'

        }

      }

    }

  });

}

}