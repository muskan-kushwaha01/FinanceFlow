using FinanceTrackerApp.DTOs.Dashboard;
using FinanceTrackerApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceTrackerApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly FinanceContext _context;

        public DashboardController(FinanceContext context)
        {
            _context = context;
        }

        // GET: api/Dashboard/summary
        [HttpGet("summary")]
        public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary()
        {
            var totalIncome = await _context.Incomes
                .SumAsync(i => (decimal?)i.Amount) ?? 0;

            var totalExpense = await _context.Expenses
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
            var recentExpenses = await _context.Expenses
                .Select(e => new RecentTransactionDto
                {
                    Type = "Expense",
                    Title = e.Merchant,
                    Amount = e.Amount,
                    TransactionDate = e.TransactionDate
                })
                .ToListAsync();

            var recentIncome = await _context.Incomes
                .Select(i => new RecentTransactionDto
                {
                    Type = "Income",
                    Title = i.Source,
                    Amount = i.Amount,
                    TransactionDate = i.TransactionDate
                })
                .ToListAsync();

            var transactions = recentExpenses
                .Concat(recentIncome)
                .OrderByDescending(t => t.TransactionDate)
                .Take(5)
                .ToList();

            return Ok(transactions);
        }
        // GET: api/Dashboard/expense-by-category
        [HttpGet("expense-by-category")]
        public async Task<ActionResult<IEnumerable<ExpenseCategoryDto>>> GetExpenseByCategory()
        {
            var data = await _context.Expenses
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