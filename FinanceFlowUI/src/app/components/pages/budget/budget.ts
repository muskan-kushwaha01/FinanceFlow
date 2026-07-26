import { Component, OnInit } from '@angular/core';
import { BudgetService } from '../../../services/budget';
import { Budget } from '../../../models/budget';
import { BudgetSummary } from '../../../models/budget-summary';
import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/category.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budget.html',
  styleUrls: ['./budget.css']
})
export class BudgetComponent implements OnInit {

  budgets: Budget[] = [];

  budgetSummary: BudgetSummary[] = [];

  categories: Category[] = [];

  showPanel = false;

  isEditMode = false;

  selectedBudgetId = 0;

  budgetChart!: Chart;
  currentMonth = '';

  totalBudget = 0;

  totalSpent = 0;

  remainingBudget = 0;

  overallHealth = 100;

  safeCount = 0;

  warningCount = 0;

  dangerCount = 0;
  selectedMonth = new Date().getMonth() + 1;

selectedYear = new Date().getFullYear();

years = [
  2025,
  2026,
  2027,
  2028
];

  months = [

    'January', 'February', 'March', 'April',

    'May', 'June', 'July', 'August',

    'September', 'October', 'November', 'December'

  ];

  newBudget = {
    categoryId: 0,

    budgetAmount: 0,

    month: new Date().getMonth() + 1,

    year: new Date().getFullYear()

  };

  private userId: number = Number(localStorage.getItem('userId'));
constructor(
  private budgetService: BudgetService,
  private categoryService: CategoryService,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {

    this.currentMonth =
      this.months[this.selectedMonth - 1] +
      " " +
      this.selectedYear;
    this.loadCategories();
    this.loadBudgets();
    this.loadSummary();
  }

  loadCategories() {

    this.categoryService.getExpenseCategories().subscribe({

      next: (data: Category[]) => {

        this.categories = data;

      },

      error: (err) => {

        console.error(err);

      }

    });

  }

  loadBudgets() {

    this.budgetService.getBudgets(this.userId).subscribe({

      next: (data: Budget[]) => {
        this.budgets = data;
      },

      error: err => {
        console.error(err);
      }

    });

  }
 loadSummary() {

  this.budgetService
      .getSummary(
          this.userId,
          this.selectedMonth,
          this.selectedYear
      )
      .subscribe({

        next: (data) => {

          this.budgetSummary = data;

         this.calculateOverview();
           this.cdr.detectChanges();


setTimeout(() => {
  this.createChart();
}, 0);
        },

        error: err => console.error(err)

      });

}

onFilterChange(){

    this.currentMonth =
      this.months[this.selectedMonth - 1] + " " + this.selectedYear;

    this.loadSummary();

}

  calculateOverview() {

    this.totalBudget = 0;

    this.totalSpent = 0;

    this.safeCount = 0;

    this.warningCount = 0;

    this.dangerCount = 0;

    

    this.budgetSummary.forEach(item => {

      this.totalBudget += item.budgetAmount;

      this.totalSpent += item.spentAmount;

      if (item.percentageUsed < 70) {

        this.safeCount++;

      }

      else if (item.percentageUsed < 100) {

        this.warningCount++;

      }

      else {

        this.dangerCount++;

      }

    });

    this.remainingBudget = this.totalBudget - this.totalSpent;

    if (this.totalBudget > 0) {

      this.overallHealth = Math.max(
        0,
        Math.round((this.remainingBudget / this.totalBudget) * 100)
      );

    }

  }

  createChart() {

    if (this.budgetChart) {
      this.budgetChart.destroy();
    }

    this.budgetChart = new Chart('budgetChart', {
      type: 'doughnut',
      data: {
        labels: ['Spent', 'Remaining'],
        datasets: [{
          data: [this.totalSpent, this.remainingBudget],
          backgroundColor: [
            '#2563EB',
            '#E5E7EB'
          ],
          borderWidth: 0
        }]
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

  saveBudget() {

    const budgetData = {
      userId: this.userId,
      categoryId: this.newBudget.categoryId,
      budgetAmount: this.newBudget.budgetAmount,
      month: this.newBudget.month,
      year: this.newBudget.year
    };

    if (this.isEditMode) {

      this.budgetService.updateBudget(this.selectedBudgetId, budgetData)
        .subscribe({

          next: () => {

            this.closePanel();

            this.loadBudgets();

            this.loadSummary();

          },

          error: err => console.error(err)

        });

    } else {

      this.budgetService.addBudget(budgetData)
        .subscribe({

          next: () => {

            this.closePanel();

            this.loadBudgets();

            this.loadSummary();

          },

          error: err => console.error(err)

        });

    }

  }
  deleteBudget(id: number) {

    if (!confirm('Delete this budget?')) {
      return;
    }

    this.budgetService.deleteBudget(id)
      .subscribe({

        next: () => {

          this.loadBudgets();

          this.loadSummary();

        },

        error: err => console.error(err)

      });

  }
  openPanel() {

    this.isEditMode = false;

    this.showPanel = true;

    this.newBudget = {

      categoryId: 0,

      budgetAmount: 0,

      month: new Date().getMonth() + 1,

      year: new Date().getFullYear()

    };

  } closePanel() {

    this.showPanel = false;

  }
editBudget(budget: BudgetSummary) {

  this.isEditMode = true;
  this.showPanel = true;

  this.selectedBudgetId = budget.budgetId;

  this.newBudget = {
    categoryId: budget.categoryId,
    budgetAmount: budget.budgetAmount,
    month: budget.month,
    year: budget.year
  };
}
}

