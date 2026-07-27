namespace FinanceTrackerApp.DTO
{
    public class SavingGoalDTO
    {
        public int GoalId { get; set; }

        public int UserId { get; set; }

        public string GoalName { get; set; } = string.Empty;

        public decimal TargetAmount { get; set; }

        public decimal SavedAmount { get; set; }

        public DateOnly? TargetDate { get; set; }

        public string? GoalColor { get; set; }
    }
}