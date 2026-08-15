import { Component, OnInit, AfterViewInit } from '@angular/core';import { Chart } from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';import { FormsModule } from '@angular/forms';
import { IncomeService } from '../../../services/income.service';
import { CategoryService } from '../../../services/category.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './income.html',
  styleUrls: ['./income.css']
})


export class IncomeComponent implements OnInit, AfterViewInit {
  // ===========================
  // Modal
  // ===========================

  showModal: boolean = false;

  // ===========================
  // Dashboard Cards
  // ===========================
isEditMode = false;

editingIncomeId: number | null = null;
totalIncome = 0;
averageIncome = 0;
highestIncome = 0;
totalEntries = 0;
topIncomeCategory = '';
topIncomeAmount = 0;

activeCategories = 0;
categoryList = '';

latestIncomeDate = '';
latestIncomeSource = '';
  // ===========================
  // Search
  // ===========================

  searchText: string = '';

  // ===========================
  // Income List
  // ===========================

incomes: any[] = [];
categories: any[] = [];
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
constructor(
  private incomeService: IncomeService,
  private categoryService: CategoryService,
  private cdr: ChangeDetectorRef
) {}
incomeChart: any;
incomePieChart: any;

ngOnInit(): void {

  this.loadCategories();

  const currentYear = new Date().getFullYear();

  for (let year = currentYear - 2; year <= currentYear; year++) {
    this.years.push(year);
  }

  this.loadIncomes();
}
onFilterChange(): void {

  this.loadIncomes();

}
loadIncomes() {

  console.log("Loading incomes...");

this.incomeService
  .getIncomes(
    this.selectedMonth,
    this.selectedYear
  )
  .subscribe({
    next: (data: any[]) => {

  this.incomes = data;

this.calculateSummary();
this.loadIncomeInsights();

this.cdr.detectChanges();   // Update the template first

setTimeout(() => {
  this.loadIncomeChart();
  this.loadPieChart();
});

},
    error: (err) => {
      console.error(err);
    }

  });

}
loadCategories() {

  this.categoryService.getIncomeCategories().subscribe({

    next: (data) => {

      this.categories = data;

    },

    error: (err) => {

      console.error(err);

    }

  });

}
  
calculateSummary() {

  console.log("calculateSummary called");

  console.log("Incomes:", this.incomes);

  this.totalEntries = this.incomes.length;

  this.totalIncome = this.incomes.reduce(
    (sum, income) => sum + income.amount,
    0
  );

  this.averageIncome = this.totalEntries
    ? Math.round(this.totalIncome / this.totalEntries)
    : 0;

  this.highestIncome = this.totalEntries
    ? Math.max(...this.incomes.map(x => x.amount))
    : 0;

  console.log("Total Income:", this.totalIncome);
  console.log("Entries:", this.totalEntries);
  console.log("Average:", this.averageIncome);
  console.log("Highest:", this.highestIncome);
}
loadIncomeInsights() {

  const categoryTotals: any = {};

  this.incomes.forEach(income => {

    if (!categoryTotals[income.category]) {
      categoryTotals[income.category] = 0;
    }

    categoryTotals[income.category] += income.amount;

  });

  const categories = Object.keys(categoryTotals);

  this.activeCategories = categories.length;

  this.categoryList = categories.join(' • ');

  if (categories.length > 0) {

    this.topIncomeCategory = categories.reduce((a, b) =>
      categoryTotals[a] > categoryTotals[b] ? a : b
    );

    this.topIncomeAmount = categoryTotals[this.topIncomeCategory];

  }

  if (this.incomes.length > 0) {

    const latest = [...this.incomes].sort((a, b) =>
      new Date(b.transactionDate).getTime() -
      new Date(a.transactionDate).getTime()
    )[0];

    this.latestIncomeDate = new Date(latest.transactionDate)
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short'
      });

    this.latestIncomeSource = latest.source;

  }

}

ngAfterViewInit(): void {



  }

  // ===========================
  // Income Trend Chart
  // ===========================
loadIncomeChart() {

  if (this.incomeChart) {
    this.incomeChart.destroy();
  }

  const daysInMonth = new Date(
    this.selectedYear,
    this.selectedMonth,
    0
  ).getDate();

  const dailyTotals = new Array(daysInMonth).fill(0);

  this.incomes.forEach(income => {

    const date = new Date(income.transactionDate);

    const day = date.getDate();

    dailyTotals[day - 1] += Number(income.amount);

  });

  const labels = dailyTotals.map(
    (_, index) => `${index + 1}`
  );

  this.incomeChart = new Chart('incomeChart', {

    type: 'line',

    data: {

      labels: labels,

      datasets: [

        {
          label: 'Income',

          data: dailyTotals,

          borderColor: '#4CAF50',

          backgroundColor: 'rgba(167,196,160,0.3)',

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

              const value = Number(context.raw);

              return ` ₹${value.toLocaleString('en-IN')}`;

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
                Number(value).toLocaleString('en-IN');

            }

          }

        }

      }

    }

  });

}
    // =====================================
  // PIE CHART
  // =====================================
loadPieChart() {

  if (this.incomePieChart) {
    this.incomePieChart.destroy();
  }

  const categoryTotals: any = {};

  this.incomes.forEach(income => {

    if (!categoryTotals[income.category]) {
      categoryTotals[income.category] = 0;
    }

    categoryTotals[income.category] += income.amount;

  });

  const labels = Object.keys(categoryTotals);

  const values = Object.values(categoryTotals);

  this.incomePieChart = new Chart('incomePieChart', {

    type: 'pie',

    data: {

      labels: labels,

      datasets: [

        {

          data: values,

          backgroundColor: [

            '#4CAF50',
            '#81C784',
            '#AED581',
            '#66BB6A',
            '#A5D6A7',
            '#388E3C'

          ],

          borderWidth: 2,

          hoverOffset: 15

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

  // =====================================
  // FILTER
  // =====================================

  changeFilter(event:any){

    const value=event.target.value;

    if(value=="6"){

      console.log("Last 6 Months");

      this.loadIncomeChart();

    }

    else if(value=="12"){

      console.log("Last 12 Months");

      this.loadIncomeChart();

    }

    else{

      console.log("View All");

      this.loadIncomeChart();

    }

  }

  // =====================================
  // SEARCH
  // =====================================

  searchIncome(){

    console.log(this.searchText);

  }

  // =====================================
  // VIEW ALL
  // =====================================

  viewAll(){

    alert("All Income Records");

  }

  // =====================================
  // OPEN MODAL
  // =====================================

  openModal(){

    this.showModal=true;

  }

  // =====================================
  // CLOSE MODAL
  // =====================================

  closeModal() {

  this.showModal = false;

  this.isEditMode = false;

  this.editingIncomeId = null;

  this.newIncome = {

    userId: Number(localStorage.getItem("userId")),

    categoryId: 0,

    amount: 0,

    source: '',

    paymentMethod: '',

    transactionDate: '',

    description: ''

  };

}
  editIncome(income: any) {

  this.isEditMode = true;

  this.editingIncomeId = income.incomeId;

  this.newIncome = {

    userId: income.userId,

    categoryId: income.categoryId,

    amount: income.amount,

    source: income.source,

    paymentMethod: income.paymentMethod,

    transactionDate: income.transactionDate,

    description: income.description

  };

  this.showModal = true;

}

  // =====================================
  // ADD INCOME
  // =====================================

 newIncome: {
  userId: number;
  categoryId: number | null;
  amount: number;
  source: string;
  paymentMethod: string;
  transactionDate: string;
  description: string;
} = {

  userId: Number(localStorage.getItem("userId")),

  categoryId: null,

  amount: 0,

  source: '',

  paymentMethod: '',

  transactionDate: '',

  description: ''

};
deleteIncome(id: number) {

  const confirmDelete = confirm(
    "Are you sure you want to delete this income?"
  );

  if (!confirmDelete) {
    return;
  }

  this.incomeService.deleteIncome(id).subscribe({

    next: () => {

      alert("Income deleted successfully.");

      this.loadIncomes();

    },

    error: (err) => {

      console.error(err);

      alert("Failed to delete income.");

    }

  });

}

saveIncome() {

  // Validate transaction date
  if (!this.newIncome.transactionDate) {

    alert('Please select a transaction date.');

    return;
  }

  // Validate that date belongs to selected month/year
  const selectedDate = new Date(
    this.newIncome.transactionDate
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


  // ================= EDIT INCOME =================

  if (this.isEditMode) {

    this.incomeService.updateIncome(
      this.editingIncomeId!,
      this.newIncome
    ).subscribe({

      next: () => {

        alert("Income Updated Successfully");

        this.closeModal();

        this.loadIncomes();

        this.isEditMode = false;
        this.editingIncomeId = null;

      },

      error: (err) => {

        console.error("Update Income Error:", err);

      }

    });

  }


  // ================= ADD INCOME =================

  else {

    this.incomeService
      .addIncome(this.newIncome)
      .subscribe({

        next: () => {

          alert("Income Added Successfully");

          this.closeModal();

          this.loadIncomes();

        },

        error: (err) => {

          console.error("Add Income Error:", err);

        }

      });

  }

}
openAddIncome(): void {

  this.isEditMode = false;
  this.editingIncomeId = null;

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

  this.newIncome.transactionDate =
    `${this.selectedYear}-${month}-${date}`;

  this.showModal = true;
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