import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ReportsService,
  ReportsSummary,
  MonthlyReport,
  ExpenseCategoryReport,
  BudgetVsActual,
  PaymentMethodReport
} from '../../../services/reports';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class ReportsComponent implements OnInit {

  userId = Number(localStorage.getItem('userId'));

  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

  years: number[] = [];
incomeExpenseChart: Chart | null = null;
expenseCategoryChart: Chart | null = null;
budgetChart: Chart | null = null;
paymentMethodChart: Chart | null = null;
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

  summary: ReportsSummary | null = null;

  monthlyReport: MonthlyReport[] = [];

  expenseCategories: ExpenseCategoryReport[] = [];

  budgetVsActual: BudgetVsActual[] = [];

  paymentMethods: PaymentMethodReport[] = [];

constructor(
  private reportsService: ReportsService,
  private cdr: ChangeDetectorRef
) {}
  ngOnInit(): void {

    const currentYear = new Date().getFullYear();

    for (let year = currentYear - 2; year <= currentYear; year++) {
      this.years.push(year);
    }

    this.loadReports();
  }

  loadReports(): void {

    this.loadSummary();

    this.loadMonthlyReport();

    this.loadExpenseCategories();

    this.loadBudgetVsActual();

    this.loadPaymentMethods();
  }

  loadSummary(): void {

  console.log('Loading report summary...');
  console.log('User ID:', this.userId);
  console.log('Month:', this.selectedMonth);
  console.log('Year:', this.selectedYear);

  this.reportsService
    .getSummary(
      this.userId,
      this.selectedMonth,
      this.selectedYear
    )
    .subscribe({

      next: (data) => {

        console.log('REPORT SUMMARY:', data);

        this.summary = data;

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'SUMMARY API ERROR:',
          error
        );

        this.summary = null;

        this.cdr.detectChanges();

      }

    });
}

  loadMonthlyReport(): void {

  this.reportsService
    .getMonthlyReport(
      this.userId,
      this.selectedYear
    )
    .subscribe({
      next: (data) => {

        this.monthlyReport = data;

        setTimeout(() => {
          this.createIncomeExpenseChart();
        });
      },

      error: (error) => {
        console.error('Error loading monthly report:', error);
      }
    });
}
  loadExpenseCategories(): void {

  this.reportsService
    .getExpenseCategories(
      this.userId,
      this.selectedMonth,
      this.selectedYear
    )
    .subscribe({
      next: (data) => {

        this.expenseCategories = data;

        setTimeout(() => {
          this.createExpenseCategoryChart();
        });

      },

      error: (error) => {
        console.error(
          'Error loading expense categories:',
          error
        );
      }
    });
}
  loadBudgetVsActual(): void {

  this.reportsService
    .getBudgetVsActual(
      this.userId,
      this.selectedMonth,
      this.selectedYear
    )
    .subscribe({
      next: (data) => {

        this.budgetVsActual = data;

        setTimeout(() => {
          this.createBudgetChart();
        });

      },

      error: (error) => {
        console.error(
          'Error loading budget report:',
          error
        );
      }
    });
}

loadPaymentMethods(): void {

  this.reportsService
    .getPaymentMethods(
      this.userId,
      this.selectedMonth,
      this.selectedYear
    )
    .subscribe({
      next: (data) => {

        this.paymentMethods = data;

        setTimeout(() => {
          this.createPaymentMethodChart();
        });

      },

      error: (error) => {
        console.error(
          'Error loading payment methods:',
          error
        );
      }
    });
}

  onFilterChange(): void {
    this.loadReports();
  }

  createIncomeExpenseChart(): void {

  const canvas = document.getElementById(
    'incomeExpenseChart'
  ) as HTMLCanvasElement;

  if (!canvas) return;

  // Destroy previous chart before creating a new one
  if (this.incomeExpenseChart) {
    this.incomeExpenseChart.destroy();
  }

  this.incomeExpenseChart = new Chart(canvas, {
    type: 'bar',

    data: {
      labels: this.monthlyReport.map(item => item.month),

      datasets: [
        {
          label: 'Income',
          data: this.monthlyReport.map(item => item.income),
          borderWidth: 2,
          borderRadius: 6
        },
        {
          label: 'Expense',
          data: this.monthlyReport.map(item => item.expense),
          borderWidth: 2,
          borderRadius: 6
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          position: 'top'
        },

        tooltip: {
          callbacks: {
            label: (context) => {
              return ` ₹${Number(context.raw).toLocaleString('en-IN')}`;
            }
          }
        }
      },

      scales: {
        y: {
          beginAtZero: true,

          ticks: {
            callback: (value) => {
              return '₹' + Number(value).toLocaleString('en-IN');
            }
          }
        }
      }
    }
  });
}

createExpenseCategoryChart(): void {

  const canvas = document.getElementById(
    'expenseCategoryChart'
  ) as HTMLCanvasElement;

  if (!canvas) return;

  if (this.expenseCategoryChart) {
    this.expenseCategoryChart.destroy();
  }

  this.expenseCategoryChart = new Chart(canvas, {
    type: 'doughnut',

    data: {
      labels: this.expenseCategories.map(
        item => item.categoryName
      ),

      datasets: [
        {
          data: this.expenseCategories.map(
            item => item.totalAmount
          ),

          borderWidth: 2
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      cutout: '65%',

      plugins: {
        legend: {
          position: 'right'
        },

        tooltip: {
          callbacks: {
            label: (context) => {

              const value = Number(context.raw);

              const percentage =
                this.expenseCategories[context.dataIndex]
                  ?.percentage ?? 0;

              return ` ₹${value.toLocaleString('en-IN')} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

createBudgetChart(): void {

  const canvas = document.getElementById(
    'budgetChart'
  ) as HTMLCanvasElement;

  if (!canvas) return;

  if (this.budgetChart) {
    this.budgetChart.destroy();
  }

  this.budgetChart = new Chart(canvas, {
    type: 'bar',

    data: {
      labels: this.budgetVsActual.map(
        item => item.categoryName
      ),

      datasets: [
        {
          label: 'Budget',
          data: this.budgetVsActual.map(
            item => item.budgetAmount
          ),
          borderWidth: 2,
          borderRadius: 6
        },

        {
          label: 'Actual',
          data: this.budgetVsActual.map(
            item => item.actualAmount
          ),
          borderWidth: 2,
          borderRadius: 6
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          position: 'top'
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

createPaymentMethodChart(): void {

  const canvas = document.getElementById(
    'paymentMethodChart'
  ) as HTMLCanvasElement;

  if (!canvas) return;

  if (this.paymentMethodChart) {
    this.paymentMethodChart.destroy();
  }

  this.paymentMethodChart = new Chart(canvas, {
    type: 'doughnut',

    data: {
      labels: this.paymentMethods.map(
        item => item.paymentMethod
      ),

      datasets: [
        {
          data: this.paymentMethods.map(
            item => item.totalAmount
          ),

          borderWidth: 2
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      cutout: '65%',

      plugins: {
        legend: {
          position: 'right'
        },

        tooltip: {
          callbacks: {
            label: (context) => {

              const value = Number(context.raw);

              const percentage =
                this.paymentMethods[context.dataIndex]
                  ?.percentage ?? 0;

              return ` ₹${value.toLocaleString('en-IN')} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}


}