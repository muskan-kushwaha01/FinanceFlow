using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinanceTrackerApp.Models;
using FinanceTrackerApp.DTOs.Expense;

[Route("api/[controller]")]
[ApiController]
public class ExpensesController : ControllerBase
{
    private readonly FinanceContext _context;
    public ExpensesController(FinanceContext context)
    {
        _context = context;
    }

    // GET: api/Expense
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetExpense()
    {
        var expenses = await _context.Expenses
            .Select(e => new ExpenseDto
            {
                ExpenseId = e.ExpenseId,
                UserId = e.UserId,
                CategoryId = e.CategoryId,
                Merchant = e.Merchant,
                Amount = e.Amount,
                PaymentMethod = e.PaymentMethod,
                TransactionDate = e.TransactionDate,
                Description = e.Description,
                ReceiptImage = e.ReceiptImage
            })
            .ToListAsync();

        return Ok(expenses);
    }
    // GET: api/Expense/5
    [HttpGet("{expenseid}")]
    public async Task<ActionResult<ExpenseDto>> GetExpense(int expenseid)
    {
        var expense = await _context.Expenses.FindAsync(expenseid);

        if (expense == null)
        {
            return NotFound();
        }

        var expenseDto = new ExpenseDto
        {
            ExpenseId = expense.ExpenseId,
            UserId = expense.UserId,
            CategoryId = expense.CategoryId,
            Merchant = expense.Merchant,
            Amount = expense.Amount,
            PaymentMethod = expense.PaymentMethod,
            TransactionDate = expense.TransactionDate,
            Description = expense.Description,
            ReceiptImage = expense.ReceiptImage
        };

        return Ok(expenseDto);
    }
    // PUT: api/Expense/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    // PUT: api/Expenses/5
    [HttpPut("{expenseid}")]
    public async Task<IActionResult> PutExpense(
     [FromRoute] int expenseid,
     [FromBody] UpdateExpenseDto dto)
    {
        var expense = await _context.Expenses.FindAsync(expenseid);

        if (expense == null)
        {
            return NotFound("Expense not found.");
        }

        expense.CategoryId = dto.CategoryId;
        expense.Merchant = dto.Merchant;
        expense.Amount = dto.Amount;
        expense.PaymentMethod = dto.PaymentMethod;
        expense.TransactionDate = dto.TransactionDate;
        expense.Description = dto.Description;
        expense.ReceiptImage = dto.ReceiptImage;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Expense updated successfully." });
    }
    // POST: api/Expense
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> PostExpense(CreateExpenseDto dto)
    {
        var expense = new Expense
        {
            UserId = dto.UserId,
            CategoryId = dto.CategoryId,
            Merchant = dto.Merchant,
            Amount = dto.Amount,
            PaymentMethod = dto.PaymentMethod,
            TransactionDate = dto.TransactionDate,
            Description = dto.Description,
            ReceiptImage = dto.ReceiptImage
        };

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        var expenseDto = new ExpenseDto
        {
            ExpenseId = expense.ExpenseId,
            UserId = expense.UserId,
            CategoryId = expense.CategoryId,
            Merchant = expense.Merchant,
            Amount = expense.Amount,
            PaymentMethod = expense.PaymentMethod,
            TransactionDate = expense.TransactionDate,
            Description = expense.Description,
            ReceiptImage = expense.ReceiptImage
        };

        return CreatedAtAction(nameof(GetExpense),
            new { expenseid = expense.ExpenseId },
            expenseDto);
    }

    // DELETE: api/Expense/5
    [HttpDelete("{expenseid}")]
    public async Task<IActionResult> DeleteExpense(int? expenseid)
    {
        var expense = await _context.Expenses.FindAsync(expenseid);
        if (expense == null)
        {
            return NotFound();
        }

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ExpenseExists(int? expenseid)
    {
        return _context.Expenses.Any(e => e.ExpenseId == expenseid);
    }
}
