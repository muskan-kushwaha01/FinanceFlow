using System;
using System.Collections.Generic;

namespace FinanceTrackerApp.Models;

public partial class Subscription
{
    public int SubscriptionId { get; set; }

    public int UserId { get; set; }

    public string SubscriptionName { get; set; } = null!;

    public string Category { get; set; } = null!;

    public decimal Amount { get; set; }

    public string BillingCycle { get; set; } = null!;

    public DateOnly NextPayment { get; set; }

    public string? PaymentMethod { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
