using FinanceTrackerApp.DTO;
using FinanceTrackerApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceTrackerApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubscriptionsController : ControllerBase
    {
        private readonly FinanceContext _context;

        public SubscriptionsController(FinanceContext context)
        {
            _context = context;
        }

        // GET: api/Subscriptions/user/1
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<SubscriptionDTO>>> GetSubscriptions(int userId)
        {
            var subscriptions = await _context.Subscriptions
                .Where(s => s.UserId == userId)
                .OrderBy(s => s.NextPayment)
                .Select(s => new SubscriptionDTO
                {
                    SubscriptionId = s.SubscriptionId,
                    UserId = s.UserId,
                    SubscriptionName = s.SubscriptionName,
                    Category = s.Category,
                    Amount = s.Amount,
                    BillingCycle = s.BillingCycle,
                    NextPayment = s.NextPayment,
                    PaymentMethod = s.PaymentMethod,
                    Status = s.Status
                })
                .ToListAsync();

            return Ok(subscriptions);
        }
        // GET: api/Subscriptions/summary/1
        [HttpGet("summary/{userId}")]
        public async Task<ActionResult<SubscriptionSummaryDTO>> GetSummary(int userId)
        {
            var subscriptions = await _context.Subscriptions
                .Where(s =>
                    s.UserId == userId &&
                    s.Status == "Active")
                .ToListAsync();

            // Total of all monthly subscriptions
            decimal monthlySubscriptions = subscriptions
                .Where(s => s.BillingCycle == "Monthly")
                .Sum(s => s.Amount);

            // Total of all yearly subscriptions
            decimal yearlySubscriptions = subscriptions
                .Where(s => s.BillingCycle == "Yearly")
                .Sum(s => s.Amount);

            // Convert yearly subscriptions to monthly equivalent
            decimal monthlyCost =
                monthlySubscriptions +
                (yearlySubscriptions / 12);

            // Convert monthly subscriptions to yearly equivalent
            decimal yearlyCost =
                (monthlySubscriptions * 12) +
                yearlySubscriptions;

            // Renewals in the next 7 days
            var today = DateOnly.FromDateTime(DateTime.Today);
            var upcomingDate = today.AddDays(7);

            int upcoming = subscriptions.Count(s =>
                s.NextPayment >= today &&
                s.NextPayment <= upcomingDate);

            var summary = new SubscriptionSummaryDTO
            {
                TotalMonthlyCost = Math.Round(monthlyCost, 2),
                TotalYearlyCost = Math.Round(yearlyCost, 2),
                ActiveSubscriptions = subscriptions.Count,
                UpcomingRenewals = upcoming
            };

            return Ok(summary);
        }
        // POST: api/Subscriptions
        [HttpPost]
        public async Task<ActionResult<Subscription>> AddSubscription(SubscriptionDTO dto)
        {
            var subscription = new Subscription
            {
                UserId = dto.UserId,
                SubscriptionName = dto.SubscriptionName,
                Category = dto.Category,
                Amount = dto.Amount,
                BillingCycle = dto.BillingCycle,
                NextPayment = dto.NextPayment,
                PaymentMethod = dto.PaymentMethod,
                Status = dto.Status,
                CreatedAt = DateTime.Now
            };

            _context.Subscriptions.Add(subscription);
            await _context.SaveChangesAsync();

            return Ok(subscription);
        }

        // PUT: api/Subscriptions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSubscription(int id, SubscriptionDTO dto)
        {
            var subscription = await _context.Subscriptions.FindAsync(id);

            if (subscription == null)
                return NotFound();

            subscription.SubscriptionName = dto.SubscriptionName;
            subscription.Category = dto.Category;
            subscription.Amount = dto.Amount;
            subscription.BillingCycle = dto.BillingCycle;
            subscription.NextPayment = dto.NextPayment;
            subscription.PaymentMethod = dto.PaymentMethod;
            subscription.Status = dto.Status;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        // POST: api/Subscriptions/process-renewals/1
        [HttpPost("process-renewals/{userId}")]
        public async Task<IActionResult> ProcessRenewals(int userId)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);

            // Get active subscriptions whose payment date has arrived
            var subscriptions = await _context.Subscriptions
                .Where(s =>
                    s.UserId == userId &&
                    s.Status == "Active" &&
                    s.NextPayment <= today)
                .ToListAsync();

            if (!subscriptions.Any())
            {
                return Ok(new
                {
                    message = "No subscriptions are due for renewal.",
                    processed = 0
                });
            }

            // Load active expense categories
            var expenseCategories = await _context.Categories
                .Where(c =>
                    c.Type == "Expense" &&
                    c.IsActive == true)
                .ToListAsync();

            int processed = 0;

            foreach (var subscription in subscriptions)
            {
                // Map subscription category to an Expense category
                string expenseCategoryName;

                switch (subscription.Category.Trim().ToLower())
                {
                    case "streaming":
                    case "music":
                    case "gaming":
                    case "entertainment":
                        expenseCategoryName = "Entertainment";
                        break;

                    case "health & fitness":
                    case "healthcare":
                        expenseCategoryName = "Healthcare";
                        break;

                    case "technology":
                        expenseCategoryName = "Technology";
                        break;

                    case "education":
                        expenseCategoryName = "Education";
                        break;

                    case "shopping":
                        expenseCategoryName = "Shopping";
                        break;

                    case "travel":
                        expenseCategoryName = "Travel";
                        break;

                    case "bills":
                        expenseCategoryName = "Bills";
                        break;

                    case "utilities":
                        expenseCategoryName = "Utilities";
                        break;

                    default:
                        expenseCategoryName = "Miscellaneous";
                        break;
                }

                var category = expenseCategories
                    .FirstOrDefault(c =>
                        c.CategoryName.Equals(
                            expenseCategoryName,
                            StringComparison.OrdinalIgnoreCase
                        ));

                if (category == null)
                {
                    return BadRequest(new
                    {
                        message =
                            $"Expense category '{expenseCategoryName}' was not found."
                    });
                }

                // Process all missed payments
                while (subscription.NextPayment <= today)
                {
                    var paymentDate = subscription.NextPayment;

                    var alreadyProcessed = await _context.Expenses.AnyAsync(e =>
                        e.UserId == subscription.UserId &&
                        e.Merchant == subscription.SubscriptionName &&
                        e.Amount == subscription.Amount &&
                        e.TransactionDate == paymentDate &&
                        e.Description ==
                            $"Recurring payment for {subscription.SubscriptionName}"
                    );

                    if (!alreadyProcessed)
                    {
                        var expense = new Expense
                        {
                            UserId = subscription.UserId,
                            CategoryId = category.CategoryId,
                            Merchant = subscription.SubscriptionName,
                            Amount = subscription.Amount,
                            PaymentMethod = subscription.PaymentMethod,
                            TransactionDate = paymentDate,
                            Description =
                                $"Recurring payment for {subscription.SubscriptionName}",
                            ReceiptImage = null
                        };

                        _context.Expenses.Add(expense);

                        processed++;
                    }

                    // Move to the next billing date
                    if (subscription.BillingCycle == "Monthly")
                    {
                        subscription.NextPayment =
                            subscription.NextPayment.AddMonths(1);
                    }
                    else if (subscription.BillingCycle == "Yearly")
                    {
                        subscription.NextPayment =
                            subscription.NextPayment.AddYears(1);
                    }
                    else
                    {
                        return BadRequest(new
                        {
                            message =
                                $"Unsupported billing cycle: {subscription.BillingCycle}"
                        });
                    }
                }
            }

            // Save all expenses and updated subscription dates
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Recurring payments processed successfully.",
                processed = processed
            });
        }

        // DELETE: api/Subscriptions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubscription(int id)
        {
            var subscription = await _context.Subscriptions.FindAsync(id);

            if (subscription == null)
                return NotFound();

            _context.Subscriptions.Remove(subscription);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}