namespace FinanceTrackerApp.DTO
{
    public class BudgetSummaryDto
    {
        public int BudgetId { get; set; }

        public int CategoryId { get; set; }

        public string CategoryName { get; set; } = string.Empty;

        public decimal BudgetAmount { get; set; }

        public decimal SpentAmount { get; set; }

        public decimal RemainingAmount { get; set; }

        public double PercentageUsed { get; set; }

        public bool IsOverBudget { get; set; }

        public int Month { get; set; }

        public int Year { get; set; }
    }
}