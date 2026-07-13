using System;
using System.Collections.Generic;

namespace FinanceTrackerApp.Models;

public partial class Category
{
    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = null!;

    public string Type { get; set; } = null!;

    public string? Icon { get; set; }

    public string? ColorCode { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();

    public virtual ICollection<Income> Incomes { get; set; } = new List<Income>();
}
