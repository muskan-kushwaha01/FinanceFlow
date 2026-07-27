using FinanceTrackerApp.DTO;
using FinanceTrackerApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceTrackerApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SavingGoalsController : ControllerBase
    {
        private readonly FinanceContext _context;

        public SavingGoalsController(FinanceContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<SavingGoalDTO>>> GetSavingGoals(int userId)
        {
            var goals = await _context.SavingGoals
                .Where(g => g.UserId == userId)
                .Select(g => new SavingGoalDTO
                {
                    GoalId = g.GoalId,
                    UserId = g.UserId,
                    GoalName = g.GoalName,
                    TargetAmount = g.TargetAmount,
                    SavedAmount = g.SavedAmount,
                    TargetDate = g.TargetDate,
                    GoalColor = g.GoalColor
                })
                .ToListAsync();

            return Ok(goals);
        }

        [HttpGet("summary/{userId}")]
        public async Task<ActionResult<IEnumerable<GoalSummaryDTO>>> GetGoalSummary(int userId)
        {
            var goals = await _context.SavingGoals
                .Where(g => g.UserId == userId)
                .ToListAsync();

            var summary = goals.Select(g => new GoalSummaryDTO
            {
                GoalId = g.GoalId,
                GoalName = g.GoalName,
                TargetAmount = g.TargetAmount,
                SavedAmount = g.SavedAmount,
                RemainingAmount = g.TargetAmount - g.SavedAmount,
                Progress = g.TargetAmount == 0
                    ? 0
                    : (double)(g.SavedAmount / g.TargetAmount * 100),
                DaysLeft = g.TargetDate.HasValue
                    ? (g.TargetDate.Value.ToDateTime(TimeOnly.MinValue) - DateTime.Today).Days
                    : 0,
                Completed = g.SavedAmount >= g.TargetAmount,
                GoalColor = g.GoalColor
            }).ToList();

            return Ok(summary);
        }

        [HttpPost]
        public async Task<ActionResult<SavingGoal>> AddSavingGoal(SavingGoalDTO dto)
        {
            var goal = new SavingGoal
            {
                UserId = dto.UserId,
                GoalName = dto.GoalName,
                TargetAmount = dto.TargetAmount,
                SavedAmount = dto.SavedAmount,
                TargetDate = dto.TargetDate,
                GoalColor = dto.GoalColor,
                CreatedAt = DateTime.Now
            };

            _context.SavingGoals.Add(goal);
            await _context.SaveChangesAsync();

            return Ok(goal);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSavingGoal(int id, SavingGoalDTO dto)
        {
            var goal = await _context.SavingGoals.FindAsync(id);

            if (goal == null)
                return NotFound();

            goal.GoalName = dto.GoalName;
            goal.TargetAmount = dto.TargetAmount;
            goal.SavedAmount = dto.SavedAmount;
            goal.TargetDate = dto.TargetDate;
            goal.GoalColor = dto.GoalColor;
            goal.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(goal);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSavingGoal(int id)
        {
            var goal = await _context.SavingGoals.FindAsync(id);

            if (goal == null)
                return NotFound();

            _context.SavingGoals.Remove(goal);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}