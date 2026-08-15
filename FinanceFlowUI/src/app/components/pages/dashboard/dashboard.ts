import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { DashboardService, MonthlyReport } from '../../../services/dashboard.service';

import { DashboardSummary } from '../../../models/dashboard-summary';
import { RecentTransaction } from '../../../models/recent-transaction';
import { ExpenseCategory } from '../../../models/expense-category';

import { NavbarComponent } from '../../app-layout/navbar/navbar';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import {
  Chart,
  ChartConfiguration,
  registerables
} from 'chart.js';
import { FormsModule } from '@angular/forms';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    MatCardModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit {

  today = new Date();

selectedMonth = new Date().getMonth() + 1;
selectedYear = new Date().getFullYear();
userId = Number(localStorage.getItem('userId'));
years: number[] = [];
monthlyReport: MonthlyReport[] = [];
months = [
  { value: 1, name: 'January' },
  { value: 2, name: 'February' },
  { value: 3, name: 'March' },
  { value: 4, name: 'April' },
  { value: 5, name: 'May' },
  { value: 6, name: 'June' },
  { value: 7, name: 'July' },
  { value: 8, name: 'August' },
  { value: 9, name: 'September' },
  { value: 10, name: 'October' },
  { value: 11, name: 'November' },
  { value: 12, name: 'December' }
];

topExpenseCategory = '';
topExpenseAmount = 0;

budgetSummary: any[] = [];

totalBudget = 0;
totalBudgetSpent = 0;
budgetPercentage = 0;
summary: DashboardSummary | null = null;

  recentTransactions: RecentTransaction[] = [];

  expenseCategories: ExpenseCategory[] = [];

  financialChart!: Chart;

  categoryChart!: Chart;

constructor(
  private dashboardService: DashboardService,
  private cdr: ChangeDetectorRef,
  private router: Router
) {}
ngOnInit(): void {

  console.log("Dashboard Loaded");

  const currentYear = new Date().getFullYear();

  for (let year = currentYear - 2; year <= currentYear; year++) {
    this.years.push(year);
  }

  this.loadDashboard();
}
loadDashboard(): void {

  this.loadSummary();

  this.loadRecentTransactions();

  this.loadExpenseCategories();

  this.loadMonthlyReport();
    this.loadBudgetProgress();

}
loadMonthlyReport(): void {

  this.dashboardService
    .getMonthlyReport(
      this.userId,
      this.selectedYear
    )
    .subscribe({

      next: (data) => {

        this.monthlyReport = data;

        this.cdr.detectChanges();

        setTimeout(() => {
          this.createFinancialChart();
        }, 0);

      },

      error: (err) => {
        console.error(
          'Monthly Report Error:',
          err
        );
      }

    });
}
  ngAfterViewInit(): void {
  // Charts are created after API data loads.
}
onFilterChange(): void {
  this.loadDashboard();
}
  //---------------- Summary ----------------//
loadSummary() {

this.dashboardService.getSummary(this.selectedMonth,this.selectedYear).subscribe({
    next: (data) => {
      this.summary = data;
      this.cdr.detectChanges();
    },

    error: (err) => {
      console.error("Summary Error:", err);
    }

  });

}
goTo(route: string) {
  this.router.navigate(['/app', route]);
}

loadBudgetProgress(): void {

  this.dashboardService
    .getBudgetSummary(
      this.userId,
      this.selectedMonth,
      this.selectedYear
    )
    .subscribe({

      next: (data) => {

        this.budgetSummary = data;

        this.totalBudget = data.reduce(
          (sum, item) => sum + item.budgetAmount,
          0
        );

        this.totalBudgetSpent = data.reduce(
          (sum, item) => sum + item.spentAmount,
          0
        );

       const actualPercentage =
  this.totalBudget > 0
    ? (this.totalBudgetSpent / this.totalBudget) * 100
    : 0;

this.budgetPercentage = Math.round(actualPercentage);

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(
          'Budget Progress Error:',
          err
        );
      }

    });
}
  //---------------- Transactions ----------------//

 loadRecentTransactions() {

this.dashboardService
  .getRecentTransactions(
    this.selectedMonth,
    this.selectedYear
  )
  .subscribe({
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

  this.dashboardService
    .getExpenseByCategory(
      this.selectedMonth,
      this.selectedYear
    )
    .subscribe({

      next: (data) => {

        this.expenseCategories = data;

        // Find highest spending category
        if (data.length > 0) {

          const topCategory = [...data].sort(
            (a, b) => b.totalAmount - a.totalAmount
          )[0];

          this.topExpenseCategory =
            topCategory.categoryName;

          this.topExpenseAmount =
            topCategory.totalAmount;

        } else {

          this.topExpenseCategory = '';
          this.topExpenseAmount = 0;

        }

        this.cdr.detectChanges();

        setTimeout(() => {
          this.createCategoryChart();
        });

      },

      error: (err) => {
        console.error(
          "Expense Category Error:",
          err
        );
      }

    });
}
  //---------------- Financial Chart ----------------//

  createFinancialChart(): void {

  const canvas = document.getElementById(
    'financialFlowChart'
  ) as HTMLCanvasElement;

  if (!canvas) return;

  this.financialChart?.destroy();

  this.financialChart = new Chart(canvas, {

    type: 'line',

    data: {

      labels: this.monthlyReport.map(
        item => item.month.substring(0, 3)
      ),

      datasets: [

        {
          label: 'Income',

          data: this.monthlyReport.map(
            item => item.income
          ),

          borderColor: '#2563EB',

          backgroundColor: 'rgba(37,99,235,.15)',

          fill: true,

          tension: .4
        },

        {
          label: 'Expense',

          data: this.monthlyReport.map(
            item => item.expense
          ),

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
        },

        tooltip: {

          callbacks: {

            label: (context) => {

              const value = Number(context.raw);

              return ` ₹${value.toLocaleString('en-IN')}`;

            }

          }

        }

      },

      scales: {

        y: {

          beginAtZero: true,

          ticks: {

            callback: (value) => {

              return '₹' +
                Number(value).toLocaleString('en-IN');

            }

          }

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