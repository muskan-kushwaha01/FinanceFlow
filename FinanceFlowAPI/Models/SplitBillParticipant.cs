using System;

namespace FinanceTrackerApp.Models
{
    public class SplitBillParticipant
    {
        public int ParticipantId { get; set; }

        public int SplitBillId { get; set; }

        public string ParticipantName { get; set; } = null!;

        public decimal AmountOwed { get; set; }

        public decimal AmountPaid { get; set; }

        public DateTime? CreatedAt { get; set; }

        // Navigation property

        public virtual SplitBill SplitBill { get; set; } = null!;
    }
}