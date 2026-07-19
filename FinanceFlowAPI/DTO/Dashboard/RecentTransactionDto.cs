namespace FinanceTrackerApp.DTOs.Dashboard
{
    public class RecentTransactionDto
    {
        public string Type { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public DateOnly Date { get; set; }
    }
}