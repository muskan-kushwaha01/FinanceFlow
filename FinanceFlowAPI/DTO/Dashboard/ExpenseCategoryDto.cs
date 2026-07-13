namespace FinanceTrackerApp.DTOs.Dashboard
{
    public class ExpenseCategoryDto
    {
        public string CategoryName { get; set; } = string.Empty;

        public decimal TotalAmount { get; set; }
    }
}