import { Component } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Expense } from '../../../models/expense';
import { ExpenseService } from '../../../services/expense.service';
import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/category.service';
import { CommonModule, DatePipe } from '@angular/common';
import { OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {DashboardService} from '../../../services/dashboard.service';
@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule
  ],
  templateUrl: './expenses.html',
  styleUrls: ['./expenses.css']
})
export class ExpenseComponent implements OnInit{
  
categories: Category[] = [];
selectedMonth = new Date().getMonth() + 1;
selectedYear = new Date().getFullYear();

years: number[] = [];

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
highestExpense = 0;
highestExpenseMerchant = '';
showModal = false;
topExpenseCategory = '';
topExpenseAmount = 0;
activeCategories = 0;
categoryList = '';
monthlyBudget = 0;
budgetSpent = 0;
budgetPercentage = 0;
latestExpenseDate = '';
latestExpenseMerchant = '';
expenseChart: Chart | null = null;
expensePieChart: Chart | null = null;
totalExpense = 0;
yearlyExpense = 0;
averageExpense = 0;
totalCategories = 0;
isEditMode = false;
editingExpenseId: number | null = null;

newExpense: Expense = {
  expenseId: 0,
  userId: Number(localStorage.getItem('userId')),
  categoryId: 0,
  merchant: '',
  amount: 0,
  paymentMethod: '',
  transactionDate: '',
  description: '',
  receiptImage: ''
};
 
  expenses: Expense[] = [];

constructor(
  private expenseService: ExpenseService,
  private categoryService: CategoryService,
  private dashboardService: DashboardService,
  private cdr: ChangeDetectorRef
) {}
ngOnInit() {

  this.loadCategories();

  const currentYear = new Date().getFullYear();

  for (let year = currentYear - 2; year <= currentYear; year++) {
    this.years.push(year);
  }

  this.loadExpenses();
}
  // ==========================
  // Open Modal
  // ==========================
getCategoryName(categoryId: number): string {

  const category = this.categories.find(
    c => c.categoryId === categoryId
  );

  return category
    ? category.categoryName
    : "Unknown";

}
openModal() {

  this.resetExpense();

  const today = new Date();

  const daysInMonth = new Date(
    this.selectedYear,
    this.selectedMonth,
    0
  ).getDate();

  const day = Math.min(
    today.getDate(),
    daysInMonth
  );

  const month = this.selectedMonth
    .toString()
    .padStart(2, '0');

  const date = day
    .toString()
    .padStart(2, '0');

  this.newExpense.transactionDate =
    `${this.selectedYear}-${month}-${date}`;

  this.showModal = true;
}

  // ==========================
  // Close Modal
  // ==========================
loadBudgetProgress(): void {

  const userId = Number(
    localStorage.getItem('userId')
  );

  this.dashboardService
    .getBudgetSummary(
      userId,
      this.selectedMonth,
      this.selectedYear
    )
    .subscribe({

      next: (data: any[]) => {

        this.monthlyBudget = data.reduce(
          (sum, item) =>
            sum + Number(item.budgetAmount),
          0
        );

        this.budgetSpent = data.reduce(
          (sum, item) =>
            sum + Number(item.spentAmount),
          0
        );

        this.budgetPercentage =
          this.monthlyBudget > 0
            ? Math.round(
                (this.budgetSpent /
                  this.monthlyBudget) * 100
              )
            : 0;

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
  closeModal() {

    this.showModal = false;

  }
 loadExpenses() {

  const userId = Number(
    localStorage.getItem('userId')
  );

  this.expenseService
    .getExpenses(
      userId,
      this.selectedMonth,
      this.selectedYear
    )
    .subscribe({

      next: (data: Expense[]) => {

        this.expenses = data;

        this.calculateSummary();
        this.loadBudgetProgress();

        this.cdr.detectChanges();

        setTimeout(() => {

          this.loadExpenseChart();

          this.loadExpensePieChart();

        });

      },

      error: (err: any) => {

        console.error(
          "Expense Error:",
          err
        );

      }

    });

}
onFilterChange(): void {

  this.loadExpenses();

}
calculateSummary() {

  // ==========================
  // Total Expense
  // ==========================

  this.totalExpense = this.expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );


  // ==========================
  // Average Expense
  // ==========================

  this.averageExpense = this.expenses.length
    ? Math.round(
        this.totalExpense / this.expenses.length
      )
    : 0;


  // ==========================
  // Highest Expense
  // ==========================

  if (this.expenses.length > 0) {

    const highestExpense = this.expenses.reduce(
      (max, expense) =>
        Number(expense.amount) > Number(max.amount)
          ? expense
          : max
    );

    this.highestExpense =
      Number(highestExpense.amount);

    this.highestExpenseMerchant =
      highestExpense.merchant;

  } else {

    this.highestExpense = 0;
    this.highestExpenseMerchant = '';

  }


  // ==========================
  // Total Categories
  // ==========================

  const uniqueCategories = new Set(
    this.expenses.map(
      expense => expense.categoryId
    )
  );

  this.totalCategories =
    uniqueCategories.size;


  // ==========================
  // Category-wise Totals
  // ==========================

  const categoryTotals =
    new Map<number, number>();

  this.expenses.forEach(expense => {

    categoryTotals.set(
      expense.categoryId,
      (categoryTotals.get(expense.categoryId) || 0)
        + Number(expense.amount)
    );

  });


  // ==========================
  // Top Spending Category
  // ==========================

  let highestAmount = 0;
  let highestCategoryId = 0;

  categoryTotals.forEach(
    (amount, categoryId) => {

      if (amount > highestAmount) {

        highestAmount = amount;
        highestCategoryId = categoryId;

      }

    }
  );

  this.topExpenseAmount =
    highestAmount;

  this.topExpenseCategory =
    highestCategoryId
      ? this.getCategoryName(highestCategoryId)
      : 'No expenses';


  // ==========================
  // Active Categories
  // ==========================

  this.activeCategories =
    categoryTotals.size;

  this.categoryList =
    Array.from(categoryTotals.keys())
      .map(id => this.getCategoryName(id))
      .join(', ');


  // ==========================
  // Latest Expense
  // ==========================

  if (this.expenses.length > 0) {

    const latestExpense =
      [...this.expenses].sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime()
      )[0];

    this.latestExpenseDate =
      new Date(
        latestExpense.transactionDate
      ).toLocaleDateString(
        'en-IN',
        {
          day: 'numeric',
          month: 'short'
        }
      );

    this.latestExpenseMerchant =
      latestExpense.merchant;

  } else {

    this.latestExpenseDate = '';
    this.latestExpenseMerchant = '';

  }

}

loadCategories() {

  this.categoryService.getExpenseCategories().subscribe({

    next: (data) => {

      this.categories = data;

    },

    error: (err) => {

      console.error(err);

    }

  });

}
    // ======================================
  // EXPENSE TREND CHART
  // ======================================

loadExpenseChart() {

  if (this.expenseChart) {
    this.expenseChart.destroy();
  }

  const daysInMonth = new Date(
    this.selectedYear,
    this.selectedMonth,
    0
  ).getDate();

  const dailyTotals = new Array(
    daysInMonth
  ).fill(0);

  this.expenses.forEach(expense => {

    const date = new Date(
      expense.transactionDate
    );

    const day = date.getDate();

    dailyTotals[day - 1] += Number(
      expense.amount
    );

  });

  const labels = dailyTotals.map(
    (_, index) => `${index + 1}`
  );

  this.expenseChart = new Chart(
    'expenseChart',
    {

      type: 'line',

      data: {

        labels: labels,

        datasets: [

          {

            label: 'Expenses',

            data: dailyTotals,

            borderColor: '#43A047',

            backgroundColor:
              'rgba(167,196,160,0.25)',

            borderWidth: 3,

            fill: true,

            tension: 0.4,

            pointRadius: 4,

            pointBackgroundColor: '#2E7D32'

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

          legend: {
            display: true
          },

          tooltip: {

            callbacks: {

              label: (context) => {

                const value =
                  Number(context.raw);

                return ` ₹${value.toLocaleString(
                  'en-IN'
                )}`;

              }

            }

          }

        },

        scales: {

          x: {

            title: {
              display: true,
              text: 'Day'
            }

          },

          y: {

            beginAtZero: true,

            ticks: {

              callback: (value) => {

                return '₹' +
                  Number(value)
                    .toLocaleString('en-IN');

              }

            }

          }

        }

      }

    }
  );

}

  // ======================================
  // PIE CHART
  // ======================================
loadExpensePieChart() {

  if (this.expensePieChart) {
    this.expensePieChart.destroy();
  }

  const categoryTotals = new Map<number, number>();

  this.expenses.forEach(expense => {

    categoryTotals.set(
      expense.categoryId,
      (categoryTotals.get(expense.categoryId) || 0) + expense.amount
    );

  });

  const labels = Array.from(categoryTotals.keys()).map(id =>
    this.getCategoryName(id)
  );

  const data = Array.from(categoryTotals.values());

  this.expensePieChart = new Chart('expensePieChart', {

    type: 'doughnut',

    data: {

      labels: labels,

      datasets: [

        {

          data: data,

          backgroundColor: [
            '#2E7D32',
            '#43A047',
            '#66BB6A',
            '#81C784',
            '#A5D6A7',
            '#C8E6C9',
            '#AED581',
            '#9CCC65'
          ],

          borderWidth: 2

        }

      ]

    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      cutout: '70%',

      plugins: {

        legend: {

          display: true,

          position: 'bottom'

        }

      }

    }

  });

}

  // ======================================
  // FILTER
  // ======================================


  // ======================================
  // VIEW ALL
  // ======================================

  viewAll(){

    alert("View All Expenses");

  }

  
editExpense(expense: Expense) {

  this.isEditMode = true;

  this.editingExpenseId = expense.expenseId;

  this.newExpense = {
    ...expense
  };

  this.showModal = true;

}

deleteExpense(expenseId: number) {

  if (!confirm("Are you sure you want to delete this expense?")) {
    return;
  }

  this.expenseService.deleteExpense(expenseId).subscribe({

    next: () => {

      alert("Expense deleted successfully!");

      this.loadExpenses();

    },

    error: (err) => {

      console.error(err);

      alert("Failed to delete expense.");

    }

  });

}

  // ======================================
  // SAVE EXPENSE
  // ======================================

 saveExpense() {
  if (!this.newExpense.transactionDate) {

  alert("Please select a transaction date.");

  return;

}

const selectedDate = new Date(
  this.newExpense.transactionDate
);

if (
  selectedDate.getMonth() + 1 !== this.selectedMonth ||
  selectedDate.getFullYear() !== this.selectedYear
) {

  alert(
    `Please select a date within ${this.months[this.selectedMonth - 1].name} ${this.selectedYear}.`
  );

  return;

}

  if (this.newExpense.categoryId == 0) {

    alert("Select Category");

    return;

  }

  if (this.newExpense.merchant.trim() == "") {

    alert("Enter Merchant Name");

    return;

  }

  if (this.newExpense.amount <= 0) {

    alert("Enter Valid Amount");

    return;

  }

  const expense: Expense = {
  expenseId: this.isEditMode ? this.editingExpenseId! : 0,
  userId: Number(localStorage.getItem('userId')),
  categoryId: this.newExpense.categoryId,
  merchant: this.newExpense.merchant,
  amount: this.newExpense.amount,
  paymentMethod: this.newExpense.paymentMethod,
transactionDate: this.newExpense.transactionDate,
  description: this.newExpense.description,
  receiptImage: this.newExpense.receiptImage
};

if (this.isEditMode) {

  this.expenseService.updateExpense(this.editingExpenseId!, expense)
    .subscribe({

      next: () => {

        alert("Expense Updated Successfully");

        this.closeModal();

        this.resetExpense();

        this.loadExpenses();

      },

      error: (err) => {

        console.error(err);

        alert("Failed to update expense");

      }

    });

} else {

  this.expenseService.addExpense(expense)
    .subscribe({

      next: () => {

        alert("Expense Added Successfully");

        this.closeModal();

        this.resetExpense();

        this.loadExpenses();

      },

      error: (err) => {

        console.error(err);

        alert("Failed to add expense");

      }

    });
  }

}

resetExpense() {

  this.newExpense = {
    expenseId: 0,
    userId: Number(localStorage.getItem('userId')),
    categoryId: 0,
    merchant: '',
    amount: 0,
    paymentMethod: '',
    transactionDate: '',
    description: '',
    receiptImage: ''
  };

  this.isEditMode = false;
  this.editingExpenseId = null;

}
getDaysInSelectedMonth(): string {

  const days = new Date(
    this.selectedYear,
    this.selectedMonth,
    0
  ).getDate();

  return days < 10
    ? '0' + days
    : days.toString();
}

}