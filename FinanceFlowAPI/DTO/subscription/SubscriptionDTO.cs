namespace FinanceTrackerApp.DTO
{
    public class SubscriptionDTO
    {
        public int SubscriptionId { get; set; }

        public int UserId { get; set; }

        public string SubscriptionName { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public string BillingCycle { get; set; } = string.Empty;

        public DateOnly NextPayment { get; set; }

        public string? PaymentMethod { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}