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
                .Where(s => s.UserId == userId && s.Status == "Active")
                .ToListAsync();

            decimal monthly = subscriptions
                .Where(s => s.BillingCycle == "Monthly")
                .Sum(s => s.Amount);

            decimal yearly = subscriptions
                .Where(s => s.BillingCycle == "Yearly")
                .Sum(s => s.Amount);

            int upcoming = subscriptions.Count(s =>
                s.NextPayment >= DateOnly.FromDateTime(DateTime.Today) &&
                s.NextPayment <= DateOnly.FromDateTime(DateTime.Today.AddDays(7)));

            var summary = new SubscriptionSummaryDTO
            {
                TotalMonthlyCost = monthly,
                TotalYearlyCost = yearly,
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