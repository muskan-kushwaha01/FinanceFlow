namespace FinanceTrackerApp.DTO
{
    public class BudgetDto
    {
        public int BudgetId { get; set; }

        public int UserId { get; set; }

        public int CategoryId { get; set; }

        public string? CategoryName { get; set; }

        public decimal BudgetAmount { get; set; }

        public int Month { get; set; }

        public int Year { get; set; }
    }
}