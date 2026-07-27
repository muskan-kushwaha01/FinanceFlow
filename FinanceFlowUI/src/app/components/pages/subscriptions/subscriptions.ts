import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionService } from '../../../services/subscription';
import { Subscription } from '../../../models/subscription';
import { SubscriptionSummary } from '../../../models/subscription-summary';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.css'
})
export class SubscriptionsComponent implements OnInit {

  userId: number = Number(localStorage.getItem('userId'));

  subscriptions: Subscription[] = [];
  showPanel = false;
subscriptionChart!: Chart;
isEditMode = false;
selectedCategory: string = '';
subscriptionCategories: string[] = [
  'Entertainment',
  'Technology',
  'Education',
  'Streaming',
  'Music',
  'Gaming',
  'Productivity',
  'Cloud Storage',
  'Finance',
  'Health & Fitness',
  'Shopping',
  'Utilities',
  'News',
  'Other'
];
searchText: string = '';
selectedSubscriptionId = 0;
newSubscription: Subscription = {
  subscriptionId: 0,
  userId: this.userId,
  subscriptionName: '',
  category: '',
  amount: 0,
  billingCycle: 'Monthly',
  nextPayment: '',
  paymentMethod: '',
  status: 'Active'
};

  summary: SubscriptionSummary = {
  totalMonthlyCost: 0,
  totalYearlyCost: 0,
  activeSubscriptions: 0,
  upcomingRenewals: 0
};
constructor(
  private subscriptionService: SubscriptionService,
  private cdr: ChangeDetectorRef
) {}
  ngOnInit(): void {
    this.loadSubscriptions();
    this.loadSummary();
  }

  loadSubscriptions(): void {

  this.subscriptionService.getSubscriptions(this.userId).subscribe({

    next: (data) => {

      this.subscriptions = data;

      this.createChart();

    },

    error: (err) => console.error(err)

  });

}
createChart(): void {

  const categoryTotals: { [key: string]: number } = {};

  this.subscriptions.forEach(sub => {

    if (sub.status === 'Active') {

      if (!categoryTotals[sub.category]) {
        categoryTotals[sub.category] = 0;
      }

      categoryTotals[sub.category] += Number(sub.amount);

    }

  });

  const labels = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);

  if (this.subscriptionChart) {
    this.subscriptionChart.destroy();
  }

  this.subscriptionChart = new Chart('subscriptionChart', {

    type: 'doughnut',

    data: {

      labels: labels,

      datasets: [

        {

          data: values,

          backgroundColor: [
            '#2563EB',
            '#10B981',
            '#F59E0B',
            '#8B5CF6',
            '#EF4444',
            '#06B6D4',
            '#EC4899',
            '#14B8A6'
          ],

          borderWidth: 0

        }

      ]

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

get upcomingSubscriptions(): Subscription[] {

  const today = new Date();

  return this.subscriptions
    .filter(sub => sub.status === 'Active')
    .sort((a, b) =>
      new Date(a.nextPayment).getTime() -
      new Date(b.nextPayment).getTime()
    )
    .slice(0, 5);

}
getDaysRemaining(date: string): string {

  const today = new Date();

  const paymentDate = new Date(date);

  const diff = paymentDate.getTime() - today.getTime();

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0)
    return "Overdue";

  if (days === 0)
    return "Today";

  if (days === 1)
    return "Tomorrow";

  return `${days} Days`;

}

get filteredSubscriptions(): Subscription[] {

  return this.subscriptions.filter(sub => {

    const matchesSearch =
      !this.searchText ||
      sub.subscriptionName.toLowerCase().includes(this.searchText.toLowerCase()) ||
      sub.category.toLowerCase().includes(this.searchText.toLowerCase());

    const matchesCategory =
      !this.selectedCategory ||
      sub.category === this.selectedCategory;

    return matchesSearch && matchesCategory;

  });

}
  loadSummary(): void {
    this.subscriptionService.getSummary(this.userId).subscribe({
      next: (data) => {
this.summary = data;
this.cdr.detectChanges();      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  deleteSubscription(id: number): void {

    if (!confirm('Delete this subscription?')) return;

    this.subscriptionService.deleteSubscription(id).subscribe(() => {

      this.loadSubscriptions();
      this.loadSummary();

    });

  }

 editSubscription(subscription: Subscription): void {

  this.isEditMode = true;

  this.showPanel = true;

  this.selectedSubscriptionId = subscription.subscriptionId;

  this.newSubscription = { ...subscription };

}
openPanel(): void {

  this.isEditMode = false;

  this.showPanel = true;

  this.newSubscription = {

    subscriptionId: 0,
    userId: this.userId,
    subscriptionName: '',
    category: '',
    amount: 0,
    billingCycle: 'Monthly',
    nextPayment: '',
    paymentMethod: '',
    status: 'Active'

  };

}
closePanel(): void {

  this.showPanel = false;

}
saveSubscription(): void {

  if (!this.newSubscription.subscriptionName.trim()) {
    alert('Please enter subscription name.');
    return;
  }

  if (!this.newSubscription.category) {
    alert('Please select a category.');
    return;
  }

  if (this.newSubscription.amount <= 0) {
    alert('Please enter a valid amount.');
    return;
  }

  if (!this.newSubscription.nextPayment) {
    alert('Please select the next payment date.');
    return;
  }

  this.newSubscription.userId = this.userId;

  if (this.isEditMode) {

    this.subscriptionService.updateSubscription(
      this.selectedSubscriptionId,
      this.newSubscription
    ).subscribe({

      next: () => {
        this.closePanel();
        this.loadSubscriptions();
        this.loadSummary();
      },

      error: err => console.error(err)

    });

  } else {

    this.subscriptionService.addSubscription(this.newSubscription)
      .subscribe({

        next: () => {
          this.closePanel();
          this.loadSubscriptions();
          this.loadSummary();
        },

        error: err => console.error(err)

      });

  }

}

}