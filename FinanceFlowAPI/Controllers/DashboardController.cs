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

        // GET: api/Dashboard/summary
        [HttpGet("summary")]
        public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary()
        {
            var userId = GetCurrentUserId();

            Console.WriteLine($"Dashboard UserId = {userId}");

            var totalIncome = await _context.Incomes
    .Where(i => i.UserId == userId)
    .SumAsync(i => (decimal?)i.Amount) ?? 0;

            var totalExpense = await _context.Expenses
                .Where(e => e.UserId == userId)
                .SumAsync(e => (decimal?)e.Amount) ?? 0;

            var summary = new DashboardSummaryDto
            {
                TotalIncome = totalIncome,
                TotalExpense = totalExpense,
                Balance = totalIncome - totalExpense
            };

            return Ok(summary);
        }

        // GET: api/Dashboard/recent-transactions
        [HttpGet("recent-transactions")]
        public async Task<ActionResult<IEnumerable<RecentTransactionDto>>> GetRecentTransactions()
        {
            var userId = GetCurrentUserId();

            var recentExpenses = await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.UserId == userId)
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
    .Where(i => i.UserId == userId)
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
.OrderByDescending(t => t.Date).Take(5)
                .ToList();

            return Ok(transactions);
        }
        // GET: api/Dashboard/expense-by-category
        [HttpGet("expense-by-category")]
        public async Task<ActionResult<IEnumerable<ExpenseCategoryDto>>> GetExpenseByCategory()
        {
            var userId = GetCurrentUserId();

            var data = await _context.Expenses
                .Where(e => e.UserId == userId)
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