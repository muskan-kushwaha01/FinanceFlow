using System;
using System.Collections.Generic;

namespace FinanceTrackerApp.Models;

public partial class SavingGoal
{
    public int GoalId { get; set; }

    public int UserId { get; set; }

    public string GoalName { get; set; } = null!;

    public decimal TargetAmount { get; set; }

    public decimal SavedAmount { get; set; }

    public DateOnly? TargetDate { get; set; }

    public string? GoalColor { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
