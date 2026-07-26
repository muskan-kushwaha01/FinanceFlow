using System;
using System.Collections.Generic;

namespace FinanceTrackerApp.Models;

public partial class Budget
{
    public int BudgetId { get; set; }

    public int UserId { get; set; }

    public int CategoryId { get; set; }

    public decimal BudgetAmount { get; set; }

    public int Month { get; set; }

    public int Year { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
