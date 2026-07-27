import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SavingGoalService } from '../../../services/saving-goal';
import { SavingGoal } from '../../../models/saving-goal';
import { GoalSummary } from '../../../models/goal-summary';
import Chart from 'chart.js/auto';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-saving-goals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './saving-goals.html',
  styleUrls: ['./saving-goals.css']
})
export class SavingGoalsComponent implements OnInit {

  userId = Number(localStorage.getItem('userId'));

  goals: SavingGoal[] = [];
  filteredGoals: SavingGoal[] = [];

  summary: GoalSummary[] = [];
goalChart: any;
  searchText = '';

  showPanel = false;
  isEditing = false;

  goal: SavingGoal = {
    goalId: 0,
    userId: this.userId,
    goalName: '',
    targetAmount: 0,
    savedAmount: 0,
    targetDate: '',
    goalColor: '#3b82f6'
  };

  totalTarget = 0;
  totalSaved = 0;
  totalRemaining = 0;
  completedGoals = 0;

  colors = [
    '#3b82f6',
    '#8b5cf6',
    '#10b981',
    '#f97316',
    '#ef4444'
  ];

constructor(
  private goalService: SavingGoalService,
  private cdr: ChangeDetectorRef
) {}
  ngOnInit() {

    this.refreshPage();

}

  loadGoals() {
    this.goalService.getGoals(this.userId).subscribe({
      next: (data) => {
        this.goals = data;
        this.filteredGoals = data;
      }
    });
  }

loadSummary() {

  this.goalService.getSummary(this.userId).subscribe({

    next: (data) => {

      this.summary = data;

      this.calculateOverview();

      setTimeout(() => {

        this.createChart();

      }, 100);

    }

  });

}
createChart() {

  if (this.goalChart) {

    this.goalChart.destroy();

  }

  const ctx = document.getElementById('goalChart') as HTMLCanvasElement;

  if (!ctx) return;

  this.goalChart = new Chart(ctx, {

    type: 'doughnut',

    data: {

      labels: ['Saved', 'Remaining'],

      datasets: [

        {

          data: [

            this.totalSaved,

            this.totalRemaining

          ],

          backgroundColor: [

            '#3b82f6',

            '#1f2937'

          ],

          borderWidth: 0,

          hoverOffset: 8

        }

      ]

    },

    options: {

      responsive: true,

      plugins: {

        legend: {

          position: 'bottom',

          labels: {

            color: 'white',

            padding: 20,

            font: {

              size: 13

            }

          }

        }

      },

      cutout: '72%'

    }

  });

}

getGoalIcon(name: string): string {

  const goal = name.toLowerCase();

  if (goal.includes('travel') || goal.includes('vacation') || goal.includes('trip'))
    return '✈️';

  if (goal.includes('car'))
    return '🚗';

  if (goal.includes('bike'))
    return '🏍️';

  if (goal.includes('house') || goal.includes('home'))
    return '🏠';

  if (goal.includes('laptop') || goal.includes('computer'))
    return '💻';

  if (goal.includes('phone'))
    return '📱';

  if (goal.includes('education') || goal.includes('study'))
    return '🎓';

  if (goal.includes('wedding'))
    return '💍';

  if (goal.includes('emergency'))
    return '💰';

  if (goal.includes('camera'))
    return '📷';

  return '🎯';
}
getProgressColor(progress: number): string {

  if (progress < 30)
    return '#ef4444';

  if (progress < 60)
    return '#f59e0b';

  if (progress < 90)
    return '#3b82f6';

  return '#10b981';

}
getMotivation(goal: GoalSummary): string {

  if (goal.completed)
    return '🎉 Congratulations! Goal Achieved';

  if (goal.progress >= 80)
    return '🔥 Almost There!';

  if (goal.progress >= 50)
    return '💪 Keep Going!';

  if (goal.progress >= 25)
    return '📈 Nice Progress!';

  return '🚀 Every Saving Counts!';
}
  calculateOverview() {

    this.totalTarget = this.summary.reduce(
      (sum, g) => sum + g.targetAmount,
      0
    );

    this.totalSaved = this.summary.reduce(
      (sum, g) => sum + g.savedAmount,
      0
    );

    this.totalRemaining = this.summary.reduce(
      (sum, g) => sum + g.remainingAmount,
      0
    );

    this.completedGoals = this.summary.filter(
      g => g.completed
    ).length;
  }

  searchGoals() {

    const text = this.searchText.toLowerCase();

    this.filteredGoals = this.goals.filter(g =>
      g.goalName.toLowerCase().includes(text)
    );
  }

  openPanel() {

    this.isEditing = false;

    this.goal = {
      goalId: 0,
      userId: this.userId,
      goalName: '',
      targetAmount: 0,
      savedAmount: 0,
      targetDate: '',
      goalColor: '#3b82f6'
    };

    this.showPanel = true;
  }

  editGoal(goal: SavingGoal) {

    this.goal = { ...goal };

    this.isEditing = true;

    this.showPanel = true;
  }

  closePanel() {
    this.showPanel = false;
  }

  saveGoal() {

  if (this.isEditing) {

    this.goalService.updateGoal(this.goal).subscribe({

      next: () => {

        this.refreshPage();

        this.closePanel();

      }

    });

  }

  else {

    this.goalService.addGoal(this.goal).subscribe({

      next: () => {

        this.refreshPage();

        this.closePanel();

      }

    });

  }

}
refreshPage() {

  this.goalService.getGoals(this.userId).subscribe({

    next: (goals) => {

      this.goals = goals;

      this.filteredGoals = goals;

      this.goalService.getSummary(this.userId).subscribe({

        next: (summary) => {

          this.summary = summary;

          this.calculateOverview();

          this.createChart();

          this.cdr.detectChanges();

        }

      });

    }

  });

}

deleteGoal(id: number) {

  if (!confirm('Delete this goal?'))
    return;

  this.goalService.deleteGoal(id).subscribe({

    next: () => {

      this.refreshPage();

    }

  });

}

  progress(goal: GoalSummary): number {

    return goal.progress;

  }

  daysLeft(goal: GoalSummary): string {

    if (goal.completed)
      return 'Completed';

    if (goal.daysLeft < 0)
      return 'Expired';

    return goal.daysLeft + ' Days Left';

  }

}