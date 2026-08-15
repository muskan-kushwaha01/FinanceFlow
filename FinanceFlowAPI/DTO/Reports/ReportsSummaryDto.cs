namespace FinanceTrackerApp.DTOs.Reports
{
    public class ReportsSummaryDto
    {
        public decimal TotalIncome { get; set; }

        public decimal TotalExpense { get; set; }

        public decimal NetSavings { get; set; }

        public double SavingsRate { get; set; }

        public decimal TotalBudget { get; set; }

        public decimal BudgetUsed { get; set; }

        public decimal BudgetRemaining { get; set; }

        public decimal MonthlySubscriptionCost { get; set; }

        public decimal YearlySubscriptionCost { get; set; }

        public decimal TotalSavingsGoalTarget { get; set; }

        public decimal TotalSavingsGoalSaved { get; set; }

        public double SavingsGoalProgress { get; set; }
    }
}