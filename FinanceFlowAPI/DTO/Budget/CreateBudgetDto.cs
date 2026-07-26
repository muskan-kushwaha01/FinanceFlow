namespace FinanceTrackerApp.DTO
{
    public class CreateBudgetDto
    {
        public int UserId { get; set; }

        public int CategoryId { get; set; }

        public decimal BudgetAmount { get; set; }

        public int Month { get; set; }

        public int Year { get; set; }
    }
}