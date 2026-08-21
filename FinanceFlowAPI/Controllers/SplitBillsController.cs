using FinanceTrackerApp.DTOs.SplitBill;
using FinanceTrackerApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class SplitBillsController : ControllerBase
{
    private readonly FinanceContext _context;

    public SplitBillsController(FinanceContext context)
    {
        _context = context;
    }

    // =========================================================
    // GET: api/SplitBills?userId=5
    // =========================================================

    [HttpGet]
    public async Task<IActionResult> GetSplitBills(
        [FromQuery] int userId)
    {
        try
        {
            var bills = await _context.SplitBills
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.BillDate)
                .Select(b => new
                {
                    splitBillId = b.SplitBillId,
                    userId = b.UserId,
                    billName = b.BillName,
                    totalAmount = b.TotalAmount,
                    billDate = b.BillDate,
                    categoryId = b.CategoryId,
                    splitType = b.SplitType,
                    paidBy = b.PaidBy,
                    createdAt = b.CreatedAt,
                    updatedAt = b.UpdatedAt,

                    participants = b.Participants
                        .Select(p => new
                        {
                            participantId = p.ParticipantId,
                            splitBillId = p.SplitBillId,
                            participantName = p.ParticipantName,
                            amountOwed = p.AmountOwed,
                            amountPaid = p.AmountPaid,
                            createdAt = p.CreatedAt
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(bills);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Error loading split bills.",
                error = ex.Message,
                innerError = ex.InnerException?.Message
            });
        }
    }


    // =========================================================
    // GET: api/SplitBills/5?userId=5
    // =========================================================

    [HttpGet("{id}")]
    public async Task<ActionResult<SplitBill>> GetSplitBill(
        int id,
        [FromQuery] int userId)
    {
        var bill = await _context.SplitBills
            .Include(b => b.Participants)
            .Include(b => b.Category)
            .FirstOrDefaultAsync(
                b =>
                    b.SplitBillId == id &&
                    b.UserId == userId
            );

        if (bill == null)
        {
            return NotFound(new
            {
                message = "Split bill not found."
            });
        }

        return Ok(bill);
    }


    // =========================================================
    // POST: api/SplitBills?userId=5
    // =========================================================

    [HttpPost]
    public async Task<IActionResult> CreateSplitBill(
        SplitBillDto dto,
        [FromQuery] int userId)
    {
        // -----------------------------------------------------
        // Validate participants
        // -----------------------------------------------------

        if (dto.Participants == null ||
            dto.Participants.Count == 0)
        {
            return BadRequest(new
            {
                message = "At least one participant is required."
            });
        }


        // -----------------------------------------------------
        // Validate PaidBy
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(dto.PaidBy))
        {
            bool payerExists = dto.Participants.Any(p =>
                p.ParticipantName.Trim()
                    .Equals(
                        dto.PaidBy.Trim(),
                        StringComparison.OrdinalIgnoreCase
                    )
            );

            if (!payerExists)
            {
                return BadRequest(new
                {
                    message =
                        "The person who paid must be one of the participants."
                });
            }
        }


        // -----------------------------------------------------
        // Validate Split Type
        // -----------------------------------------------------

        if (dto.SplitType.Equals(
            "Equal",
            StringComparison.OrdinalIgnoreCase))
        {
            decimal equalAmount =
                Math.Round(
                    dto.TotalAmount /
                    dto.Participants.Count,
                    2
                );

            foreach (var participant in dto.Participants)
            {
                participant.AmountOwed = equalAmount;
            }

            decimal totalOwed =
                dto.Participants.Sum(
                    p => p.AmountOwed
                );

            decimal difference =
                dto.TotalAmount - totalOwed;

            if (difference != 0)
            {
                dto.Participants[0].AmountOwed +=
                    difference;
            }
        }
        else if (dto.SplitType.Equals(
            "Unequal",
            StringComparison.OrdinalIgnoreCase))
        {
            decimal totalOwed =
                dto.Participants.Sum(
                    p => p.AmountOwed
                );

            if (Math.Abs(
                totalOwed - dto.TotalAmount
            ) > 0.01m)
            {
                return BadRequest(new
                {
                    message =
                        "The total of participant amounts must equal the bill amount."
                });
            }
        }
        else
        {
            return BadRequest(new
            {
                message =
                    "Invalid split type. Use Equal or Unequal."
            });
        }


        // -----------------------------------------------------
        // Create Bill
        // -----------------------------------------------------

        var bill = new SplitBill
        {
            UserId = userId,

            BillName = dto.BillName,

            TotalAmount = dto.TotalAmount,

            BillDate = DateOnly.FromDateTime(dto.BillDate),

            CategoryId = dto.CategoryId,

            SplitType = dto.SplitType,

            PaidBy = dto.PaidBy,

            CreatedAt = DateTime.Now,

            UpdatedAt = DateTime.Now
        };


        // -----------------------------------------------------
        // Add Participants
        // -----------------------------------------------------

        foreach (var participant in dto.Participants)
        {
            bill.Participants.Add(
                new SplitBillParticipant
                {
                    ParticipantName =
                        participant.ParticipantName.Trim(),

                    AmountOwed =
                        participant.AmountOwed,

                    AmountPaid =
                        participant.AmountPaid,

                    CreatedAt =
                        DateTime.Now
                }
            );
        }


        _context.SplitBills.Add(bill);

        await _context.SaveChangesAsync();


        // =====================================================
        // CREATE EXPENSE FOR CURRENT USER
        // =====================================================

        await CreateOrUpdateSplitBillExpense(
            bill,
            userId
        );

        await _context.SaveChangesAsync();


        return Ok(new
        {
            message =
                "Split bill created successfully.",

            splitBillId =
                bill.SplitBillId
        });
    }


    // =========================================================
    // PUT: api/SplitBills/5?userId=5
    // =========================================================

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSplitBill(
        int id,
        SplitBillDto dto,
        [FromQuery] int userId)
    {
        // -----------------------------------------------------
        // Find bill belonging to user
        // -----------------------------------------------------

        var bill = await _context.SplitBills
            .Include(b => b.Participants)
            .FirstOrDefaultAsync(
                b =>
                    b.SplitBillId == id &&
                    b.UserId == userId
            );

        if (bill == null)
        {
            return NotFound(new
            {
                message = "Split bill not found."
            });
        }


        // -----------------------------------------------------
        // Validate participants
        // -----------------------------------------------------

        if (dto.Participants == null ||
            dto.Participants.Count == 0)
        {
            return BadRequest(new
            {
                message = "At least one participant is required."
            });
        }


        // -----------------------------------------------------
        // Validate PaidBy
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(dto.PaidBy))
        {
            bool payerExists = dto.Participants.Any(p =>
                p.ParticipantName.Trim()
                    .Equals(
                        dto.PaidBy.Trim(),
                        StringComparison.OrdinalIgnoreCase
                    )
            );

            if (!payerExists)
            {
                return BadRequest(new
                {
                    message =
                        "The person who paid must be one of the participants."
                });
            }
        }


        // -----------------------------------------------------
        // Validate Split Type
        // -----------------------------------------------------

        if (dto.SplitType.Equals(
            "Equal",
            StringComparison.OrdinalIgnoreCase))
        {
            decimal equalAmount =
                Math.Round(
                    dto.TotalAmount /
                    dto.Participants.Count,
                    2
                );

            foreach (var participant in dto.Participants)
            {
                participant.AmountOwed =
                    equalAmount;
            }

            decimal totalOwed =
                dto.Participants.Sum(
                    p => p.AmountOwed
                );

            decimal difference =
                dto.TotalAmount - totalOwed;

            if (difference != 0)
            {
                dto.Participants[0].AmountOwed +=
                    difference;
            }
        }
        else if (dto.SplitType.Equals(
            "Unequal",
            StringComparison.OrdinalIgnoreCase))
        {
            decimal totalOwed =
                dto.Participants.Sum(
                    p => p.AmountOwed
                );

            if (Math.Abs(
                totalOwed - dto.TotalAmount
            ) > 0.01m)
            {
                return BadRequest(new
                {
                    message =
                        "The total of participant amounts must equal the bill amount."
                });
            }
        }
        else
        {
            return BadRequest(new
            {
                message =
                    "Invalid split type. Use Equal or Unequal."
            });
        }


        // -----------------------------------------------------
        // Update Bill
        // -----------------------------------------------------

        bill.BillName =
            dto.BillName;

        bill.TotalAmount =
            dto.TotalAmount;

        bill.BillDate =
    DateOnly.FromDateTime(dto.BillDate);

        bill.CategoryId =
            dto.CategoryId;

        bill.SplitType =
            dto.SplitType;

        bill.PaidBy =
            dto.PaidBy;

        bill.UpdatedAt =
            DateTime.Now;


        // -----------------------------------------------------
        // Remove old participants
        // -----------------------------------------------------

        _context.SplitBillParticipants.RemoveRange(
            bill.Participants
        );


        // -----------------------------------------------------
        // Add updated participants
        // -----------------------------------------------------

        foreach (var participant in dto.Participants)
        {
            bill.Participants.Add(
                new SplitBillParticipant
                {
                    SplitBillId =
                        bill.SplitBillId,

                    ParticipantName =
                        participant.ParticipantName.Trim(),

                    AmountOwed =
                        participant.AmountOwed,

                    AmountPaid =
                        participant.AmountPaid,

                    CreatedAt =
                        DateTime.Now
                }
            );
        }


        await _context.SaveChangesAsync();


        // =====================================================
        // UPDATE LINKED EXPENSE
        // =====================================================

        await CreateOrUpdateSplitBillExpense(
            bill,
            userId
        );

        await _context.SaveChangesAsync();


        return Ok(new
        {
            message =
                "Split bill updated successfully."
        });
    }


    // =========================================================
    // DELETE: api/SplitBills/5?userId=5
    // =========================================================

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSplitBill(
        int id,
        [FromQuery] int userId)
    {
        // -----------------------------------------------------
        // Find bill belonging to user
        // -----------------------------------------------------

        var bill = await _context.SplitBills
            .FirstOrDefaultAsync(
                b =>
                    b.SplitBillId == id &&
                    b.UserId == userId
            );

        if (bill == null)
        {
            return NotFound(new
            {
                message =
                    "Split bill not found."
            });
        }


        // =====================================================
        // DELETE LINKED EXPENSE
        // =====================================================

        var linkedExpense =
            await _context.Expenses
                .FirstOrDefaultAsync(
                    e =>
                        e.SplitBillId == id &&
                        e.UserId == userId
                );

        if (linkedExpense != null)
        {
            _context.Expenses.Remove(
                linkedExpense
            );
        }


        // -----------------------------------------------------
        // Delete Split Bill
        // -----------------------------------------------------

        _context.SplitBills.Remove(
            bill
        );

        await _context.SaveChangesAsync();


        return Ok(new
        {
            message =
                "Split bill and linked expense deleted successfully."
        });
    }


    // =========================================================
    // CREATE / UPDATE SPLIT BILL EXPENSE
    // =========================================================

    private async Task CreateOrUpdateSplitBillExpense(
        SplitBill bill,
        int userId)
    {
        // -----------------------------------------------------
        // Get current user
        // -----------------------------------------------------

        var user = await _context.Users
            .FindAsync(userId);

        if (user == null)
        {
            return;
        }


        // -----------------------------------------------------
        // Find current user's participant
        // -----------------------------------------------------

        var participant =
            await _context.SplitBillParticipants
                .FirstOrDefaultAsync(
                    p =>
                        p.SplitBillId ==
                        bill.SplitBillId &&

                        p.ParticipantName
                            .Trim()
                            .ToLower() ==

                        user.FullName
                            .Trim()
                            .ToLower()
                );


        if (participant == null)
        {
            return;
        }


        // -----------------------------------------------------
        // Find existing linked expense
        // -----------------------------------------------------

        var expense =
            await _context.Expenses
                .FirstOrDefaultAsync(
                    e =>
                        e.SplitBillId ==
                        bill.SplitBillId &&

                        e.UserId ==
                        userId
                );

        if (!bill.CategoryId.HasValue)
        {
            if (expense != null)
            {
                _context.Expenses.Remove(expense);
            }

            return;
        }
        // -----------------------------------------------------
        // If user's share is zero
        // -----------------------------------------------------

        if (participant.AmountOwed <= 0)
        {
            if (expense != null)
            {
                _context.Expenses.Remove(
                    expense
                );
            }

            return;
        }


        // -----------------------------------------------------
        // Create Expense
        // -----------------------------------------------------

        if (expense == null)
        {
            expense = new Expense
            {
                UserId =
                    userId,

                SplitBillId =
                    bill.SplitBillId,

                CreatedAt =
                    DateTime.Now
            };

            _context.Expenses.Add(
                expense
            );
        }


        // -----------------------------------------------------
        // Update Expense
        // -----------------------------------------------------

        expense.CategoryId =
     bill.CategoryId.Value;

        expense.Merchant =
            bill.BillName;

        expense.Amount =
            participant.AmountOwed;

        expense.PaymentMethod =
            "Split Bill";

        expense.TransactionDate =
            bill.BillDate;
        expense.Description =
            $"Split Bill: {bill.BillName}";
    }
}