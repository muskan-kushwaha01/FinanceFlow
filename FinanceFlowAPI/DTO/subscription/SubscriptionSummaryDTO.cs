namespace FinanceTrackerApp.DTO
{
    public class SubscriptionSummaryDTO
    {
        public decimal TotalMonthlyCost { get; set; }

        public decimal TotalYearlyCost { get; set; }

        public int ActiveSubscriptions { get; set; }

        public int UpcomingRenewals { get; set; }
    }
}