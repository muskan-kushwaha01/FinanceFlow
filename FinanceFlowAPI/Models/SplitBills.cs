using System;
using System.Collections.Generic;

namespace FinanceTrackerApp.Models
{
    public partial class SplitBill
    {
        public int SplitBillId { get; set; }

        public int UserId { get; set; }

        public string BillName { get; set; } = null!;

        public decimal TotalAmount { get; set; }

        public DateOnly BillDate { get; set; }

        public int? CategoryId { get; set; }

        public string SplitType { get; set; } = null!;

        public string? PaidBy { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public virtual User User { get; set; } = null!;

        public virtual Category? Category { get; set; }

        public virtual ICollection<SplitBillParticipant> Participants
        { get; set; }
            = new List<SplitBillParticipant>();

        public virtual ICollection<Expense> Expenses
        { get; set; }
            = new List<Expense>();
    }
}