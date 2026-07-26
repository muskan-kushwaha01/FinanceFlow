export interface BudgetSummary {
  budgetId: number;
  categoryId: number;

  categoryName: string;

  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;

  percentageUsed: number;
  isOverBudget: boolean;

  month: number;
  year: number;
}