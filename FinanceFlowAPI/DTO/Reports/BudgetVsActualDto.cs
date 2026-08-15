namespace FinanceTrackerApp.DTOs.Reports
{
    public class BudgetVsActualDto
    {
        public string CategoryName { get; set; } = string.Empty;

        public decimal BudgetAmount { get; set; }

        public decimal ActualAmount { get; set; }

        public decimal Difference { get; set; }

        public double PercentageUsed { get; set; }

        public bool IsOverBudget { get; set; }
    }
}