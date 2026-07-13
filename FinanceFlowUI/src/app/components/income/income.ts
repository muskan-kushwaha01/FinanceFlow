import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Income } from '../../models/income';
import { IncomeService } from '../../services/income.service';

@Component({
  selector: 'app-income',
  imports: [CommonModule],
  templateUrl: './income.html',
  styleUrl: './income.css'
})
export class IncomeComponent  implements OnInit {

  incomes: Income[] = [];

  constructor(private incomeService: IncomeService) { }

  ngOnInit(): void {
    this.loadIncomes();
  }

  loadIncomes() {
    this.incomeService.getIncomes().subscribe({
      next: (data) => {
        this.incomes = data;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

}