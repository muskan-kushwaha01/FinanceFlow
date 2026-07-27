namespace FinanceTrackerApp.DTO
{
    public class GoalSummaryDTO
    {
        public int GoalId { get; set; }

        public string GoalName { get; set; } = string.Empty;

        public decimal TargetAmount { get; set; }

        public decimal SavedAmount { get; set; }

        public decimal RemainingAmount { get; set; }

        public double Progress { get; set; }

        public int DaysLeft { get; set; }

        public bool Completed { get; set; }

        public string? GoalColor { get; set; }
    }
}