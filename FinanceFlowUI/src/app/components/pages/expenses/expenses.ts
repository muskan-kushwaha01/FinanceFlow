import { Component } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Expense } from '../../../models/expense';
import { ExpenseService } from '../../../services/expense.service';
import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/category.service';
import { CommonModule, DatePipe } from '@angular/common';
import { OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
showModal = false;
topExpenseCategory = '';
topExpenseAmount = 0;

activeCategories = 0;
categoryList = '';

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
  private cdr: ChangeDetectorRef
) {}
  ngOnInit() {
  this.loadCategories();
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
  this.showModal = true;
}

  // ==========================
  // Close Modal
  // ==========================

  closeModal() {

    this.showModal = false;

  }
 loadExpenses() {

const userId = Number(localStorage.getItem('userId'));

this.expenseService.getExpenses(userId).subscribe({
    next: (data: Expense[]) => {

  this.expenses = data;

  this.calculateSummary();

  this.cdr.detectChanges();

  this.loadExpenseChart();

  this.loadExpensePieChart();

},

    error: (err: any) => {

      console.error(err);

    }

  });

}

calculateSummary() {

  // ==========================
  // Total Expense
  // ==========================

  this.totalExpense = this.expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // ==========================
  // Average Expense
  // ==========================

  this.averageExpense = this.expenses.length
    ? Math.round(this.totalExpense / this.expenses.length)
    : 0;

  // ==========================
  // Total Categories
  // ==========================

  const uniqueCategories = new Set(
    this.expenses.map(expense => expense.categoryId)
  );

  this.totalCategories = uniqueCategories.size;

  // ==========================
  // Category-wise Totals
  // ==========================

  const categoryTotals = new Map<number, number>();

  this.expenses.forEach(expense => {

    categoryTotals.set(
      expense.categoryId,
      (categoryTotals.get(expense.categoryId) || 0) + expense.amount
    );

  });

  // ==========================
  // Top Spending Category
  // ==========================

  let highestAmount = 0;
  let highestCategoryId = 0;

  categoryTotals.forEach((amount, categoryId) => {

    if (amount > highestAmount) {

      highestAmount = amount;
      highestCategoryId = categoryId;

    }

  });

  this.topExpenseAmount = highestAmount;
  this.topExpenseCategory = this.getCategoryName(highestCategoryId);

  // ==========================
  // Active Categories
  // ==========================

  this.activeCategories = categoryTotals.size;

  this.categoryList = Array.from(categoryTotals.keys())
    .map(id => this.getCategoryName(id))
    .join(', ');

  // ==========================
  // Latest Expense
  // ==========================

  if (this.expenses.length > 0) {

    const latestExpense = [...this.expenses].sort(
      (a, b) =>
        new Date(b.transactionDate).getTime() -
        new Date(a.transactionDate).getTime()
    )[0];

    this.latestExpenseDate = new Date(latestExpense.transactionDate)
      .toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
      });

    this.latestExpenseMerchant = latestExpense.merchant;

  } else {

    this.latestExpenseDate = '';
    this.latestExpenseMerchant = '';

  }

}

loadCategories() {

  this.categoryService.getExpenseCategories().subscribe({

    next: (data) => {

      this.categories = data;

      this.calculateSummary();
      this.loadExpensePieChart();

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

  // Group expenses by month
  const monthlyTotals = new Map<string, number>();

  this.expenses.forEach(expense => {

    const month = new Date(expense.transactionDate)
      .toLocaleString('default', { month: 'short' });

    monthlyTotals.set(
      month,
      (monthlyTotals.get(month) || 0) + expense.amount
    );

  });

  const labels = Array.from(monthlyTotals.keys());
  const data = Array.from(monthlyTotals.values());

  this.expenseChart = new Chart('expenseChart', {

    type: 'line',

    data: {

      labels: labels,

      datasets: [

        {

          label: 'Expenses',

          data: data,

          borderColor: '#43A047',

          backgroundColor: 'rgba(167,196,160,0.25)',

          borderWidth: 3,

          fill: true,

          tension: 0.4,

          pointRadius: 5,

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

        }

      }

    }

  });

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

  changeFilter(event:any){

    const value = event.target.value;

    console.log("Selected :", value);

  }

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
  transactionDate: this.isEditMode
    ? this.newExpense.transactionDate
    : new Date().toISOString().split('T')[0],
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
}