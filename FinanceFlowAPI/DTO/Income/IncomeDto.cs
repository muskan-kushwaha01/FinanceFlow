namespace FinanceTrackerApp.DTOs.Income
{
    public class IncomeDto
    {
        public int IncomeId { get; set; }

        public int UserId { get; set; }

        public int CategoryId { get; set; }

        public decimal Amount { get; set; }

        public string Source { get; set; } = string.Empty;

        public string PaymentMethod { get; set; } = string.Empty;

        public DateOnly TransactionDate { get; set; }

        public string? Description { get; set; }
    }
}