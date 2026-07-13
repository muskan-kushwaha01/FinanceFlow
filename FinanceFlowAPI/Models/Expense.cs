using System;
using System.Collections.Generic;

namespace FinanceTrackerApp.Models;

public partial class Expense
{
    public int ExpenseId { get; set; }

    public int UserId { get; set; }

    public int CategoryId { get; set; }

    public string Merchant { get; set; } = null!;

    public decimal Amount { get; set; }

    public string PaymentMethod { get; set; } = null!;

    public DateOnly TransactionDate { get; set; }

    public string? Description { get; set; }

    public string? ReceiptImage { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
