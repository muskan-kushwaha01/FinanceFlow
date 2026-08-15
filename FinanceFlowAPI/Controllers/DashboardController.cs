using FinanceTrackerApp.DTOs.Dashboard;
using FinanceTrackerApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace FinanceTrackerApp.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly FinanceContext _context;

        public DashboardController(FinanceContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? User.FindFirst(JwtRegisteredClaimNames.NameId)?.Value;

            return int.Parse(userId!);
        }


        // ==========================================
        // DASHBOARD SUMMARY
        // GET: api/Dashboard/summary?month=8&year=2026
        // ==========================================

        [HttpGet("summary")]
        public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary(
            [FromQuery] int month,
            [FromQuery] int year)
        {
            var userId = GetCurrentUserId();

            var startDate = new DateOnly(year, month, 1);
            var endDate = startDate.AddMonths(1);

            var totalIncome = await _context.Incomes
                .Where(i =>
                    i.UserId == userId &&
                    i.TransactionDate >= startDate &&
                    i.TransactionDate < endDate)
                .SumAsync(i => (decimal?)i.Amount) ?? 0;

            var totalExpense = await _context.Expenses
                .Where(e =>
                    e.UserId == userId &&
                    e.TransactionDate >= startDate &&
                    e.TransactionDate < endDate)
                .SumAsync(e => (decimal?)e.Amount) ?? 0;

            var summary = new DashboardSummaryDto
            {
                TotalIncome = totalIncome,
                TotalExpense = totalExpense,
                Balance = totalIncome - totalExpense
            };

            return Ok(summary);
        }


        // ==========================================
        // RECENT TRANSACTIONS
        // GET: api/Dashboard/recent-transactions?month=8&year=2026
        // ==========================================

        [HttpGet("recent-transactions")]
        public async Task<ActionResult<IEnumerable<RecentTransactionDto>>> GetRecentTransactions(
            [FromQuery] int month,
            [FromQuery] int year)
        {
            var userId = GetCurrentUserId();

            var startDate = new DateOnly(year, month, 1);
            var endDate = startDate.AddMonths(1);

            var recentExpenses = await _context.Expenses
                .Include(e => e.Category)
                .Where(e =>
                    e.UserId == userId &&
                    e.TransactionDate >= startDate &&
                    e.TransactionDate < endDate)
                .Select(e => new RecentTransactionDto
                {
                    Type = "Expense",
                    Description = e.Merchant,
                    Category = e.Category.CategoryName,
                    Amount = e.Amount,
                    Date = e.TransactionDate
                })
                .ToListAsync();

            var recentIncome = await _context.Incomes
                .Where(i =>
                    i.UserId == userId &&
                    i.TransactionDate >= startDate &&
                    i.TransactionDate < endDate)
                .Select(i => new RecentTransactionDto
                {
                    Type = "Income",
                    Description = i.Source,
                    Category = i.Source,
                    Amount = i.Amount,
                    Date = i.TransactionDate
                })
                .ToListAsync();

            var transactions = recentExpenses
                .Concat(recentIncome)
                .OrderByDescending(t => t.Date)
                .Take(5)
                .ToList();

            return Ok(transactions);
        }


        // ==========================================
        // EXPENSE BY CATEGORY
        // GET: api/Dashboard/expense-by-category?month=8&year=2026
        // ==========================================

        [HttpGet("expense-by-category")]
        public async Task<ActionResult<IEnumerable<ExpenseCategoryDto>>> GetExpenseByCategory(
            [FromQuery] int month,
            [FromQuery] int year)
        {
            var userId = GetCurrentUserId();

            var startDate = new DateOnly(year, month, 1);
            var endDate = startDate.AddMonths(1);

            var data = await _context.Expenses
                .Where(e =>
                    e.UserId == userId &&
                    e.TransactionDate >= startDate &&
                    e.TransactionDate < endDate)
                .Include(e => e.Category)
                .GroupBy(e => e.Category.CategoryName)
                .Select(g => new ExpenseCategoryDto
                {
                    CategoryName = g.Key!,
                    TotalAmount = g.Sum(x => x.Amount)
                })
                .ToListAsync();

            return Ok(data);
        }
    }
}