import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Expense } from '../../models/expense';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-expenses',
  imports: [CommonModule],
  templateUrl: './expenses.html',
  styleUrl: './expenses.css'
})
export class Expenses implements OnInit {

  expenses: Expense[] = [];

  constructor(private expenseService: ExpenseService){}

  ngOnInit(): void {

    this.loadExpenses();

  }

  loadExpenses(){

    this.expenseService.getExpenses().subscribe({

      next:(data)=>{

        this.expenses=data;

      },

      error:(err)=>{

        console.log(err);

      }

    });

  }

}