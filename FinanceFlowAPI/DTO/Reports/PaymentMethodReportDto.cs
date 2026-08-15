namespace FinanceTrackerApp.DTOs.Reports
{
    public class PaymentMethodReportDto
    {
        public string PaymentMethod { get; set; } = string.Empty;

        public decimal TotalAmount { get; set; }

        public double Percentage { get; set; }
    }
}