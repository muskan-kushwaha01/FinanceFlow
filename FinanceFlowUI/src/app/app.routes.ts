import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Expenses } from './components/expenses/expenses';
import { IncomeComponent  } from './components/income/income';


export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: Dashboard
  },
    { path: 'expenses',
       component: Expenses 
    },
    { path: 'income', component: IncomeComponent  }


];