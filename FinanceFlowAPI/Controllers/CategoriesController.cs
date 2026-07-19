using FinanceTrackerApp.DTOs.Category;
using FinanceTrackerApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceTrackerApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly FinanceContext _context;

        public CategoriesController(FinanceContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories(
            [FromQuery] string? type)
        {
            var query = _context.Categories.AsQueryable();

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(c => c.Type == type);
            }

            var categories = await query
                .Where(c => c.IsActive == true)
                .Select(c => new CategoryDto
                {
                    CategoryId = c.CategoryId,
                    CategoryName = c.CategoryName
                })
                .ToListAsync();

            return Ok(categories);
        }
    }
}