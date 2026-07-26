namespace FinanceTrackerApp.DTO
{
    public class UpdateBudgetDto
    {
        public int CategoryId { get; set; }

        public decimal BudgetAmount { get; set; }

        public int Month { get; set; }

        public int Year { get; set; }
    }
}