import { Component, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-expense',
  templateUrl: './expenses.html',
  styleUrls: ['./expenses.css']
})
export class ExpenseComponent implements AfterViewInit {

  // ==========================
  // Modal
  // ==========================

  showModal = false;

  // ==========================
  // Dashboard Cards
  // ==========================

  totalExpense = 28500;
  yearlyExpense = 135200;
  averageExpense = 4750;
  totalCategories = 7;

  // ==========================
  // Add Expense Model
  // ==========================

  newExpense = {

    category: '',
    merchant: '',
    amount: 0,
    payment: '',
    description: ''

  };

  // ==========================
  // Dummy Expense List
  // ==========================

  expenses = [

    {

      category: 'Food',

      merchant: 'Dominos',

      amount: 650,

      payment: 'UPI',

      date: '10 Jul'

    },

    {

      category: 'Shopping',

      merchant: 'Zara',

      amount: 2200,

      payment: 'Card',

      date: '09 Jul'

    },

    {

      category: 'Transport',

      merchant: 'Uber',

      amount: 350,

      payment: 'Cash',

      date: '08 Jul'

    },

    {

      category: 'Entertainment',

      merchant: 'PVR',

      amount: 900,

      payment: 'UPI',

      date: '07 Jul'

    },

    {

      category: 'Bills',

      merchant: 'Electricity',

      amount: 2800,

      payment: 'Net Banking',

      date: '05 Jul'

    }

  ];

  constructor() {}

  ngAfterViewInit(): void {

    this.loadExpenseChart();

    this.loadExpensePieChart();

  }

  // ==========================
  // Open Modal
  // ==========================

  openModal() {

    this.showModal = true;

  }

  // ==========================
  // Close Modal
  // ==========================

  closeModal() {

    this.showModal = false;

  }
    // ======================================
  // EXPENSE TREND CHART
  // ======================================

  loadExpenseChart() {

    new Chart('expenseChart', {

      type: 'line',

      data: {

        labels: [

          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul'

        ],

        datasets: [

          {

            label: 'Expenses',

            data: [

              18000,
              22000,
              19500,
              24000,
              26000,
              27500,
              28500

            ],

            borderColor: '#43A047',

            backgroundColor: 'rgba(167,196,160,0.25)',

            borderWidth: 3,

            fill: true,

            tension: .4,

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

    new Chart('expensePieChart', {

      type: 'doughnut',

      data: {

        labels: [

          'Food',
          'Shopping',
          'Transport',
          'Bills',
          'Entertainment'

        ],

        datasets: [

          {

            data: [

              9675,
              5130,
              4845,
              3360,
              2280

            ],

            backgroundColor: [

              '#2E7D32',
              '#66BB6A',
              '#81C784',
              '#A5D6A7',
              '#C8E6C9'

            ],

            borderWidth:2

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        cutout: '70%',

        plugins: {

          legend: {

            display:false

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

  // ======================================
  // SAVE EXPENSE
  // ======================================

  saveExpense(){

    if(this.newExpense.category==""){

      alert("Select Category");

      return;

    }

    if(this.newExpense.merchant==""){

      alert("Enter Merchant Name");

      return;

    }

    if(this.newExpense.amount<=0){

      alert("Enter Valid Amount");

      return;

    }

    const today=new Date();

    const date=today.toLocaleDateString('en-GB',{

      day:'2-digit',

      month:'short'

    });

    this.expenses.unshift({

      category:this.newExpense.category,

      merchant:this.newExpense.merchant,

      amount:this.newExpense.amount,

      payment:this.newExpense.payment,

      date:date

    });

    this.totalExpense+=this.newExpense.amount;

    this.averageExpense=Math.round(this.totalExpense/this.expenses.length);

    this.newExpense={

      category:'',

      merchant:'',

      amount:0,

      payment:'',

      description:''

    };

    this.showModal=false;

    alert("Expense Added Successfully");

  }

}