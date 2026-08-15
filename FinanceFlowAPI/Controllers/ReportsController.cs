using FinanceTrackerApp.DTOs.Reports;
using FinanceTrackerApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceTrackerApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly FinanceContext _context;

        public ReportsController(FinanceContext context)
        {
            _context = context;
        }

        // GET: api/Reports/summary/1?month=8&year=2026
        [HttpGet("summary/{userId}")]
        public async Task<ActionResult<ReportsSummaryDto>> GetSummary(
            int userId,
            [FromQuery] int month,
            [FromQuery] int year)
        {
            var startDate = new DateOnly(year, month, 1);
            var endDate = startDate.AddMonths(1);

            // -------------------------
            // INCOME
            // -------------------------
            var totalIncome = await _context.Incomes
                .Where(i =>
                    i.UserId == userId &&
                    i.TransactionDate >= startDate &&
                    i.TransactionDate < endDate)
                .SumAsync(i => (decimal?)i.Amount) ?? 0;

            // -------------------------
            // EXPENSE
            // -------------------------
            var totalExpense = await _context.Expenses
                .Where(e =>
                    e.UserId == userId &&
                    e.TransactionDate >= startDate &&
                    e.TransactionDate < endDate)
                .SumAsync(e => (decimal?)e.Amount) ?? 0;

            // -------------------------
            // NET SAVINGS
            // -------------------------
            var netSavings = totalIncome - totalExpense;

            double savingsRate = 0;

            if (totalIncome > 0)
            {
                savingsRate = Math.Round(
                    (double)((netSavings / totalIncome) * 100),
                    2);
            }

            // -------------------------
            // BUDGET
            // -------------------------
            var totalBudget = await _context.Budgets
                .Where(b =>
                    b.UserId == userId &&
                    b.Month == month &&
                    b.Year == year)
                .SumAsync(b => (decimal?)b.BudgetAmount) ?? 0;

            var budgetUsed = totalExpense;

            var budgetRemaining = totalBudget - budgetUsed;

            // -------------------------
            // SUBSCRIPTIONS
            // -------------------------
            var activeSubscriptions = await _context.Subscriptions
                .Where(s =>
                    s.UserId == userId &&
                    s.Status == "Active")
                .ToListAsync();

            decimal monthlySubscriptionCost = activeSubscriptions
    .Where(s => s.BillingCycle == "Monthly")
    .Sum(s => s.Amount);

            decimal yearlySubscriptionCost = activeSubscriptions
                .Where(s => s.BillingCycle == "Yearly")
                .Sum(s => s.Amount);

            // Convert yearly subscriptions into monthly equivalent
            decimal yearlyMonthlyEquivalent =
                yearlySubscriptionCost / 12;

            // Total monthly subscription cost
            decimal totalMonthlySubscriptionCost =
                monthlySubscriptionCost + yearlyMonthlyEquivalent;

            // Total yearly subscription cost
            decimal totalYearlySubscriptionCost =
                (monthlySubscriptionCost * 12) + yearlySubscriptionCost;

            // -------------------------
            // SAVINGS GOALS
            // -------------------------
            var savingsGoals = await _context.SavingGoals
                .Where(g => g.UserId == userId)
                .ToListAsync();

            var totalSavingsGoalTarget = savingsGoals
                .Sum(g => g.TargetAmount);

            var totalSavingsGoalSaved = savingsGoals
                .Sum(g => g.SavedAmount);

            double savingsGoalProgress = 0;

            if (totalSavingsGoalTarget > 0)
            {
                savingsGoalProgress = Math.Round(
    (double)((totalSavingsGoalSaved /
              totalSavingsGoalTarget) * 100),
    2);

                savingsGoalProgress = Math.Min(
                    savingsGoalProgress,
                    100
                );
            }

            // -------------------------
            // FINAL REPORT
            // -------------------------
            var report = new ReportsSummaryDto
            {
                TotalIncome = totalIncome,

                TotalExpense = totalExpense,

                NetSavings = netSavings,

                SavingsRate = savingsRate,

                TotalBudget = totalBudget,

                BudgetUsed = budgetUsed,

                BudgetRemaining = budgetRemaining,
                MonthlySubscriptionCost = totalMonthlySubscriptionCost,
                YearlySubscriptionCost = totalYearlySubscriptionCost,

                TotalSavingsGoalTarget = totalSavingsGoalTarget,

                TotalSavingsGoalSaved = totalSavingsGoalSaved,

                SavingsGoalProgress = savingsGoalProgress
            };

            return Ok(report);
        }

        // GET: api/Reports/monthly/2?year=2026
        [HttpGet("monthly/{userId}")]
        public async Task<ActionResult<IEnumerable<MonthlyReportDto>>> GetMonthlyReport(
            int userId,
            [FromQuery] int year)
        {
            var monthlyReport = new List<MonthlyReportDto>();

            for (int month = 1; month <= 12; month++)
            {
                var startDate = new DateOnly(year, month, 1);
                var endDate = startDate.AddMonths(1);

                var income = await _context.Incomes
                    .Where(i =>
                        i.UserId == userId &&
                        i.TransactionDate >= startDate &&
                        i.TransactionDate < endDate)
                    .SumAsync(i => (decimal?)i.Amount) ?? 0;

                var expense = await _context.Expenses
                    .Where(e =>
                        e.UserId == userId &&
                        e.TransactionDate >= startDate &&
                        e.TransactionDate < endDate)
                    .SumAsync(e => (decimal?)e.Amount) ?? 0;

                monthlyReport.Add(new MonthlyReportDto
                {
                    Month = startDate.ToDateTime(TimeOnly.MinValue).ToString("MMMM"),
                    MonthNumber = month,
                    Income = income,
                    Expense = expense
                });
            }

            return Ok(monthlyReport);
        }

        // GET: api/Reports/expense-categories/2?month=7&year=2026
        [HttpGet("expense-categories/{userId}")]
        public async Task<ActionResult<IEnumerable<ExpenseCategoryReportDto>>> GetExpenseCategories(
            int userId,
            [FromQuery] int month,
            [FromQuery] int year)
        {
            var startDate = new DateOnly(year, month, 1);
            var endDate = startDate.AddMonths(1);

            var expenses = await _context.Expenses
                .Where(e =>
                    e.UserId == userId &&
                    e.TransactionDate >= startDate &&
                    e.TransactionDate < endDate)
                .Include(e => e.Category)
                .ToListAsync();

            var totalExpense = expenses.Sum(e => e.Amount);

            var report = expenses
                .GroupBy(e => e.Category.CategoryName)
                .Select(g => new ExpenseCategoryReportDto
                {
                    CategoryName = g.Key,
                    TotalAmount = g.Sum(e => e.Amount),
                    Percentage = totalExpense > 0
                        ? Math.Round((double)(g.Sum(e => e.Amount) / totalExpense * 100), 2)
                        : 0
                })
                .OrderByDescending(x => x.TotalAmount)
                .ToList();

            return Ok(report);
        }

        // GET: api/Reports/budget-vs-actual/2?month=7&year=2026
        [HttpGet("budget-vs-actual/{userId}")]
        public async Task<ActionResult<IEnumerable<BudgetVsActualDto>>> GetBudgetVsActual(
            int userId,
            [FromQuery] int month,
            [FromQuery] int year)
        {
            var budgets = await _context.Budgets
                .Where(b =>
                    b.UserId == userId &&
                    b.Month == month &&
                    b.Year == year)
                .Include(b => b.Category)
                .ToListAsync();

            var startDate = new DateOnly(year, month, 1);
            var endDate = startDate.AddMonths(1);

            var expenses = await _context.Expenses
                .Where(e =>
                    e.UserId == userId &&
                    e.TransactionDate >= startDate &&
                    e.TransactionDate < endDate)
                .ToListAsync();

            var report = budgets.Select(b =>
            {
                var actualAmount = expenses
                    .Where(e => e.CategoryId == b.CategoryId)
                    .Sum(e => e.Amount);

                var difference = b.BudgetAmount - actualAmount;

                double percentageUsed = b.BudgetAmount > 0
                    ? Math.Round(
                        (double)(actualAmount / b.BudgetAmount * 100),
                        2)
                    : 0;

                return new BudgetVsActualDto
                {
                    CategoryName = b.Category.CategoryName,

                    BudgetAmount = b.BudgetAmount,

                    ActualAmount = actualAmount,

                    Difference = difference,

                    PercentageUsed = percentageUsed,

                    IsOverBudget = actualAmount > b.BudgetAmount
                };
            })
            .OrderByDescending(x => x.ActualAmount)
            .ToList();

            return Ok(report);
        }

        // GET: api/Reports/payment-methods/2?month=7&year=2026
        [HttpGet("payment-methods/{userId}")]
        public async Task<ActionResult<IEnumerable<PaymentMethodReportDto>>> GetPaymentMethods(
            int userId,
            [FromQuery] int month,
            [FromQuery] int year)
        {
            var startDate = new DateOnly(year, month, 1);
            var endDate = startDate.AddMonths(1);

            var expenses = await _context.Expenses
                .Where(e =>
                    e.UserId == userId &&
                    e.TransactionDate >= startDate &&
                    e.TransactionDate < endDate)
                .ToListAsync();

            var totalExpense = expenses.Sum(e => e.Amount);

            var report = expenses
                .GroupBy(e => e.PaymentMethod)
                .Select(g => new PaymentMethodReportDto
                {
                    PaymentMethod = g.Key,

                    TotalAmount = g.Sum(e => e.Amount),

                    Percentage = totalExpense > 0
                        ? Math.Round(
                            (double)(g.Sum(e => e.Amount) / totalExpense * 100),
                            2)
                        : 0
                })
                .OrderByDescending(x => x.TotalAmount)
                .ToList();

            return Ok(report);
        }
    }
}