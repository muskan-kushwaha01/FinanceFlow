using System.ComponentModel.DataAnnotations;

namespace FinanceTrackerApp.DTOs.SplitBill
{
    public class SplitBillDto
    {
        [Required]
        public string BillName { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal TotalAmount { get; set; }

        [Required]
        public DateTime BillDate { get; set; }

        public int? CategoryId { get; set; }
        public string? PaidBy { get; set; }

        [Required]
        public string SplitType { get; set; } = string.Empty;

        [Required]
        public List<SplitBillParticipantDto> Participants { get; set; }
            = new List<SplitBillParticipantDto>();
    }
}