using System;
using System.Collections.Generic;

namespace FinanceTrackerApp.Models;

public partial class Income
{
    public int IncomeId { get; set; }

    public int UserId { get; set; }

    public int CategoryId { get; set; }

    public decimal Amount { get; set; }

    public string Source { get; set; } = null!;

    public string PaymentMethod { get; set; } = null!;

    public DateOnly TransactionDate { get; set; }

    public string? Description { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
