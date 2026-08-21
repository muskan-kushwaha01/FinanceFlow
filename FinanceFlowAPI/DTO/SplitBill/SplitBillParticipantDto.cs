using System.ComponentModel.DataAnnotations;

namespace FinanceTrackerApp.DTOs.SplitBill
{
    public class SplitBillParticipantDto
    {
        [Required]
        public string ParticipantName { get; set; } = string.Empty;

        public decimal AmountOwed { get; set; }

        public decimal AmountPaid { get; set; }
    }
}