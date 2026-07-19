using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinanceTrackerApp.Models;
using FinanceTrackerApp.DTOs.Income;

[Route("api/[controller]")]
[ApiController]
public class IncomesController : ControllerBase
{
    private readonly FinanceContext _context;
    public IncomesController(FinanceContext context)
    {
        _context = context;
    }

    // GET: api/Income

    [HttpGet]
    public async Task<ActionResult<IEnumerable<IncomeDto>>> GetIncomesByUser([FromQuery] int userId) {       
        var incomes = await _context.Incomes
    .Where(i => i.UserId == userId)
    .Include(i => i.Category)
    .Select(i => new IncomeDto
    {
        IncomeId = i.IncomeId,
        UserId = i.UserId,

        CategoryId = i.CategoryId,
        Category = i.Category.CategoryName,

        Amount = i.Amount,
        Source = i.Source,
        PaymentMethod = i.PaymentMethod,
        TransactionDate = i.TransactionDate,
        Description = i.Description
    })
    .ToListAsync();

        return Ok(incomes);
    }

    // GET: api/Income/5
    // GET: api/Income/5
    [HttpGet("{incomeid}")]
    public async Task<ActionResult<IncomeDto>> GetIncome(int incomeid)
    {
        var income = await _context.Incomes.FindAsync(incomeid);

        if (income == null)
        {
            return NotFound();
        }

        var incomeDto = new IncomeDto
        {
            IncomeId = income.IncomeId,
            UserId = income.UserId,
            CategoryId = income.CategoryId,
            Amount = income.Amount,
            Source = income.Source,
            PaymentMethod = income.PaymentMethod,
            TransactionDate = income.TransactionDate,
            Description = income.Description
        };

        return Ok(incomeDto);
    }

    // PUT: api/Income/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    // PUT: api/Income/5
    [HttpPut("{incomeid}")]
    public async Task<IActionResult> PutIncome(
        [FromRoute] int incomeid,
        [FromBody] UpdateIncomeDto dto)
    {
        var income = await _context.Incomes.FindAsync(incomeid);

        if (income == null)
        {
            return NotFound("Income not found.");
        }

        income.CategoryId = dto.CategoryId;
        income.Amount = dto.Amount;
        income.Source = dto.Source;
        income.PaymentMethod = dto.PaymentMethod;
        income.TransactionDate = dto.TransactionDate;
        income.Description = dto.Description;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Income updated successfully."
        });
    }
    // POST: api/Income
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    // POST: api/Income
    [HttpPost]
    public async Task<ActionResult<IncomeDto>> PostIncome(CreateIncomeDto dto)
    {
        var income = new Income
        {
            UserId = dto.UserId,
            CategoryId = dto.CategoryId,
            Amount = dto.Amount,
            Source = dto.Source,
            PaymentMethod = dto.PaymentMethod,
            TransactionDate = dto.TransactionDate,
            Description = dto.Description
        };

        _context.Incomes.Add(income);
        await _context.SaveChangesAsync();

        var incomeDto = new IncomeDto
        {
            IncomeId = income.IncomeId,
            UserId = income.UserId,
            CategoryId = income.CategoryId,
            Amount = income.Amount,
            Source = income.Source,
            PaymentMethod = income.PaymentMethod,
            TransactionDate = income.TransactionDate,
            Description = income.Description
        };

        return CreatedAtAction(nameof(GetIncomesByUser),
    new { userId = income.UserId },
    incomeDto);
    }

    // DELETE: api/Income/5
    // DELETE: api/Income/5
    [HttpDelete("{incomeid}")]
    public async Task<IActionResult> DeleteIncome(int incomeid)
    {
        var income = await _context.Incomes.FindAsync(incomeid);

        if (income == null)
        {
            return NotFound();
        }

        _context.Incomes.Remove(income);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Income deleted successfully."
        });
    }

    private bool IncomeExists(int? incomeid)
    {
        return _context.Incomes.Any(e => e.IncomeId == incomeid);
    }
}
