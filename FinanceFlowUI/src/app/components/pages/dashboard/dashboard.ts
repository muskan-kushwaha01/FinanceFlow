import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { DashboardService } from '../../../services/dashboard.service';

import { DashboardSummary } from '../../../models/dashboard-summary';
import { RecentTransaction } from '../../../models/recent-transaction';
import { ExpenseCategory } from '../../../models/expense-category';

import { NavbarComponent } from '../../app-layout/navbar/navbar';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import {
  Chart,
  ChartConfiguration,
  registerables
} from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit {

  today = new Date();

  summary: DashboardSummary | null = null;

  recentTransactions: RecentTransaction[] = [];

  expenseCategories: ExpenseCategory[] = [];

  financialChart!: Chart;

  categoryChart!: Chart;

constructor(
  private dashboardService: DashboardService,
  private cdr: ChangeDetectorRef
) {}
ngOnInit(): void {

  console.log("Dashboard Loaded");

  this.loadSummary();

  this.loadRecentTransactions();

  this.loadExpenseCategories();

}

  ngAfterViewInit(): void {

    // Wait until HTML is rendered

    setTimeout(() => {

      this.createFinancialChart();

    });

  }

  //---------------- Summary ----------------//
loadSummary() {

  this.dashboardService.getSummary().subscribe({

    next: (data) => {
      this.summary = data;
      this.cdr.detectChanges();
    },

    error: (err) => {
      console.error("Summary Error:", err);
    }

  });

}

  //---------------- Transactions ----------------//

 loadRecentTransactions() {

  this.dashboardService.getRecentTransactions().subscribe({

    next: (data) => {
      this.recentTransactions = data;
      this.cdr.detectChanges();
    },

    error: (err) => {
      console.error("Recent Transaction Error:", err);
    }

  });

}
  //---------------- Expense Categories ----------------//

  loadExpenseCategories() {

  this.dashboardService.getExpenseByCategory().subscribe({

    next: (data) => {

      this.expenseCategories = data;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.createCategoryChart();
      });

    },

    error: (err) => {
      console.error("Expense Category Error:", err);
    }

  });

}
  //---------------- Financial Chart ----------------//

  createFinancialChart() {

    const canvas = document.getElementById(
      'financialFlowChart'
    ) as HTMLCanvasElement;

    if (!canvas) return;

    this.financialChart?.destroy();

    this.financialChart = new Chart(canvas, {

      type: 'line',

      data: {

        labels: [

          'Jan',

          'Feb',

          'Mar',

          'Apr',

          'May',

          'Jun'

        ],

        datasets: [

          {

            label: 'Income',

            data: [25000, 32000, 28000, 35000, 41000, 50000],

            borderColor: '#2563EB',

            backgroundColor: 'rgba(37,99,235,.15)',

            fill: true,

            tension: .4

          },

          {

            label: 'Expense',

            data: [12000, 15000, 11000, 18000, 16000, 22000],

            borderColor: '#EF4444',

            backgroundColor: 'rgba(239,68,68,.12)',

            fill: true,

            tension: .4

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

          legend: {

            position: 'bottom'

          }

        }

      }

    });

  }

  //---------------- Category Chart ----------------//

  createCategoryChart() {

    const canvas = document.getElementById(
      'expenseByCategoryChart'
    ) as HTMLCanvasElement;

    if (!canvas) return;

    this.categoryChart?.destroy();

    this.categoryChart = new Chart(canvas, {

      type: 'doughnut',

      data: {

        labels: this.expenseCategories.map(x => x.categoryName),

        datasets: [

          {

            data: this.expenseCategories.map(x => x.totalAmount),

            backgroundColor: [

              '#2563EB',

              '#10B981',

              '#F59E0B',

              '#EF4444',

              '#7C3AED',

              '#06B6D4'

            ],

            borderWidth: 0

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        cutout: '70%',

        plugins: {

          legend: {

            position: 'bottom'

          }

        }

      }

    });

  }

}