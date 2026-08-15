namespace FinanceTrackerApp.DTOs.Reports
{
    public class MonthlyReportDto
    {
        public string Month { get; set; } = string.Empty;

        public int MonthNumber { get; set; }

        public decimal Income { get; set; }

        public decimal Expense { get; set; }
    }
}