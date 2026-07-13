namespace FinanceTrackerApp.DTOs.Expense
{
    public class UpdateExpenseDto
    {
        public int CategoryId { get; set; }

        public string Merchant { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public string PaymentMethod { get; set; } = string.Empty;

        public DateOnly TransactionDate { get; set; }

        public string? Description { get; set; }

        public string? ReceiptImage { get; set; }
    }
}