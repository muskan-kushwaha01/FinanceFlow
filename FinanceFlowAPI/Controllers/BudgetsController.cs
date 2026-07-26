using FinanceTrackerApp.DTO;
using FinanceTrackerApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceTrackerApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BudgetsController : ControllerBase
    {
        private readonly FinanceContext _context;

        public BudgetsController(FinanceContext context)
        {
            _context = context;
        }

        // GET: api/Budgets/user/1
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<BudgetDto>>> GetBudgets(int userId)
        {
            var budgets = await _context.Budgets
                .Where(b => b.UserId == userId)
                .Join(_context.Categories,
                    b => b.CategoryId,
                    c => c.CategoryId,
                    (b, c) => new BudgetDto
                    {
                        BudgetId = b.BudgetId,
                        UserId = b.UserId,
                        CategoryId = b.CategoryId,
                        CategoryName = c.CategoryName,
                        BudgetAmount = b.BudgetAmount,
                        Month = b.Month,
                        Year = b.Year
                    })
                .ToListAsync();

            return Ok(budgets);
        }

        // POST: api/Budgets
        [HttpPost]
        public async Task<ActionResult> CreateBudget(CreateBudgetDto dto)
        {
            var budget = new Budget
            {
                UserId = dto.UserId,
                CategoryId = dto.CategoryId,
                BudgetAmount = dto.BudgetAmount,
                Month = dto.Month,
                Year = dto.Year
            };

            _context.Budgets.Add(budget);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Budget created successfully." });
        }

        // PUT: api/Budgets/5
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateBudget(int id, UpdateBudgetDto dto)
        {
            var budget = await _context.Budgets.FindAsync(id);

            if (budget == null)
                return NotFound();

            budget.CategoryId = dto.CategoryId;
            budget.BudgetAmount = dto.BudgetAmount;
            budget.Month = dto.Month;
            budget.Year = dto.Year;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Budget updated successfully." });
        }

        // DELETE: api/Budgets/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteBudget(int id)
        {
            var budget = await _context.Budgets.FindAsync(id);

            if (budget == null)
                return NotFound();

            _context.Budgets.Remove(budget);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Budget deleted successfully." });
        }

        // GET: api/Budgets/summary/1?month=7&year=2026
        [HttpGet("summary/{userId}")]
        public async Task<ActionResult<IEnumerable<BudgetSummaryDto>>> GetBudgetSummary(
            int userId,
            [FromQuery] int month,
            [FromQuery] int year)
        {
            var budgets = await _context.Budgets
                .Where(b => b.UserId == userId &&
                            b.Month == month &&
                            b.Year == year)
                .ToListAsync();

            var startDate = new DateOnly(year, month, 1);
            var endDate = startDate.AddMonths(1);

            var expenses = await _context.Expenses
                .Where(e => e.UserId == userId &&
                            e.TransactionDate >= startDate &&
                            e.TransactionDate < endDate)
                .ToListAsync();

            var categories = await _context.Categories.ToListAsync();

            var summary = budgets.Select(b =>
            {
                var spent = expenses
                    .Where(e => e.CategoryId == b.CategoryId)
                    .Sum(e => e.Amount);

                var remaining = b.BudgetAmount - spent;

                decimal percentage = 0;

                if (b.BudgetAmount > 0)
                {
                    percentage = Math.Round((spent / b.BudgetAmount) * 100, 2);
                }
                return new BudgetSummaryDto
                {
                    BudgetId = b.BudgetId,

                    CategoryId = b.CategoryId,

                    CategoryName = categories
                        .First(c => c.CategoryId == b.CategoryId)
                        .CategoryName,

                    BudgetAmount = b.BudgetAmount,

                    SpentAmount = spent,

                    RemainingAmount = remaining,

                    PercentageUsed = (double)percentage,

                    IsOverBudget = spent > b.BudgetAmount,

                    Month = b.Month,

                    Year = b.Year
                };
            }).ToList();

            return Ok(summary);
        }
    }
}