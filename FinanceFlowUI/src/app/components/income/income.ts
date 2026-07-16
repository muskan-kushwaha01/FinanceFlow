import { Component, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './income.html',
  styleUrls: ['./income.css']
})
export class IncomeComponent implements AfterViewInit {

  // ===========================
  // Modal
  // ===========================

  showModal: boolean = false;

  // ===========================
  // Dashboard Cards
  // ===========================

  totalIncome: number = 95500;
  averageIncome: number = 15928;
  highestIncome: number = 50000;
  totalEntries: number = 7;

  // ===========================
  // Search
  // ===========================

  searchText: string = '';

  // ===========================
  // Income List
  // ===========================

  incomes = [

    {
      date: '01 Jul 2026',
      source: 'Salary',
      category: 'Salary',
      payment: 'Bank Transfer',
      amount: 50000
    },

    {
      date: '03 Jul 2026',
      source: 'Freelancing',
      category: 'Freelancing',
      payment: 'UPI',
      amount: 12000
    },

    {
      date: '05 Jul 2026',
      source: 'Business',
      category: 'Business',
      payment: 'Bank Transfer',
      amount: 18000
    },

    {
      date: '08 Jul 2026',
      source: 'Freelancing',
      category: 'Freelancing',
      payment: 'Google Pay',
      amount: 8500
    },

    {
      date: '10 Jul 2026',
      source: 'Bonus',
      category: 'Salary',
      payment: 'Bank Transfer',
      amount: 3000
    },

    {
      date: '12 Jul 2026',
      source: 'Business',
      category: 'Business',
      payment: 'Cash',
      amount: 15000
    },

    {
      date: '14 Jul 2026',
      source: 'Freelancing',
      category: 'Freelancing',
      payment: 'PhonePe',
      amount: 7000
    }

  ];

  constructor() { }

  ngAfterViewInit(): void {

    this.loadIncomeChart();

    this.loadPieChart();

  }

  // ===========================
  // Income Trend Chart
  // ===========================

  loadIncomeChart() {

    new Chart('incomeChart', {

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

            label: 'Income',

            data: [

              45000,
              52000,
              38000,
              60000,
              48000,
              71000,
              95500

            ],

            borderColor: '#4CAF50',

            backgroundColor: 'rgba(167,196,160,0.3)',

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
    // =====================================
  // PIE CHART
  // =====================================

  loadPieChart() {

    new Chart('incomePieChart', {

      type: 'pie',

      data: {

        labels: [

          'Salary',

          'Freelancing',

          'Business'

        ],

        datasets: [

          {

            data: [

              53000,

              27500,

              15000

            ],

            backgroundColor: [

              '#4CAF50',

              '#81C784',

              '#AED581'

            ],

            borderWidth:2,

            hoverOffset:15

          }

        ]

      },

      options:{

        responsive:true,

        maintainAspectRatio:false,

        plugins:{

          legend:{

            position:'bottom'

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

  closeModal(){

    this.showModal=false;

  }

  // =====================================
  // ADD INCOME
  // =====================================

  newIncome={

    source:'',

    category:'',

    amount:0,

    payment:'',

    description:''

  };

  saveIncome(){

    if(this.newIncome.source==""){

      alert("Enter Income Source");

      return;

    }

    if(this.newIncome.amount<=0){

      alert("Enter Valid Amount");

      return;

    }

    const today=new Date();

    const date=today.toLocaleDateString('en-GB',{

      day:'2-digit',

      month:'short',

      year:'numeric'

    });

    this.incomes.unshift({

      date:date,

      source:this.newIncome.source,

      category:this.newIncome.category,

      payment:this.newIncome.payment,

      amount:this.newIncome.amount

    });

    this.totalIncome+=this.newIncome.amount;

    this.totalEntries=this.incomes.length;

    this.averageIncome=Math.round(this.totalIncome/this.totalEntries);

    if(this.newIncome.amount>this.highestIncome){

      this.highestIncome=this.newIncome.amount;

    }

    this.newIncome={

      source:'',

      category:'',

      amount:0,

      payment:'',

      description:''

    };

    this.showModal=false;

    alert("Income Added Successfully");

  }

}