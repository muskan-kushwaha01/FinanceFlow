import { Routes } from '@angular/router';

import { LoginComponent } from './components/auth/login/login';
import { LayoutComponent } from './components/app-layout/layout/layout';
import { ReportsComponent } from './components/pages/reports/reports';
import { Dashboard } from './components/pages/dashboard/dashboard';
import { IncomeComponent } from './components/pages/income/income';
import { ExpenseComponent } from './components/pages/expenses/expenses';
import { BudgetComponent } from './components/pages/budget/budget';
import { SubscriptionsComponent } from './components/pages/subscriptions/subscriptions';
import { SavingGoalsComponent } from './components/pages/saving-goals/saving-goals';
import { SettingsComponent } from './components/pages/settings/settings';
import { ProfileComponent } from './components/pages/profile/profile';


export const routes: Routes = [

  {
    path: '',
    component: LoginComponent
  },

  {
    path: 'app',
    component: LayoutComponent,
    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        component: Dashboard
      },

      {
        path: 'income',
        component: IncomeComponent
      },
      {
        path: 'budget',
        component: BudgetComponent
      },
      {
        path: 'expenses',
        component: ExpenseComponent
      },
      {
  path: 'subscriptions',
  component: SubscriptionsComponent
},
{
  path: 'saving-goals',
  component: SavingGoalsComponent
},
{
  path: 'reports',
  component: ReportsComponent
},
 {
    path: 'settings',
    component: SettingsComponent
  },
  {
  path: 'profile',
  component: ProfileComponent
}

    ]
  },

  {
    path: '**',
    redirectTo: ''
  }

];