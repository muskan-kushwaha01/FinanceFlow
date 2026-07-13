namespace FinanceTrackerApp.DTOs.Dashboard
{
    public class RecentTransactionDto
    {
        public string Type { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public DateOnly TransactionDate { get; set; }
    }
}