import { Routes } from '@angular/router';

import { LoginComponent } from './components/auth/login/login';
import { LayoutComponent } from './components/app-layout/layout/layout';

import { Dashboard } from './components/pages/dashboard/dashboard';
import { IncomeComponent } from './components/pages/income/income';
import { ExpenseComponent } from './components/pages/expenses/expenses';

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
        path: 'expenses',
        component: ExpenseComponent
      }

    ]
  },

  {
    path: '**',
    redirectTo: ''
  }

];