namespace FinanceTrackerApp.DTOs.Reports
{
    public class ExpenseCategoryReportDto
    {
        public string CategoryName { get; set; } = string.Empty;

        public decimal TotalAmount { get; set; }

        public double Percentage { get; set; }
    }
}