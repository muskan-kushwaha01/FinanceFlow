using FinanceTrackerApp;
using FinanceTrackerApp.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly FinanceContext _context;

    public UsersController(FinanceContext context)
    {
        _context = context;
    }

    // GET: api/Users
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUser()
    {
        return await _context.Users.ToListAsync();
    }

    // GET: api/Users/5
    [HttpGet("{userid}")]
    public async Task<ActionResult<User>> GetUser(int userid)
    {
        var user = await _context.Users.FindAsync(userid);

        if (user == null)
        {
            return NotFound();
        }

        return user;
    }

    // POST: api/Users/register
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterModel register)
    {
        // Check if email already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == register.Email);

        if (existingUser != null)
        {
            return BadRequest(new
            {
                message = "Email already exists."
            });
        }

        var passwordHasher = new PasswordHasher<User>();

        var user = new User
        {
            FullName = register.FullName,
            Email = register.Email,
            PasswordHash = "",
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now,
            IsActive = true
        };

        user.PasswordHash = passwordHasher.HashPassword(user, register.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Registration successful."
        });
    }

    
    // PUT: api/Users/5
    [HttpPut("{userid}")]
    public async Task<IActionResult> PutUser(int? userid, User user)
    {
        if (userid != user.UserId)
        {
            return BadRequest();
        }

        _context.Entry(user).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!UserExists(userid))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/Users/5
    [HttpDelete("{userid}")]
    public async Task<IActionResult> DeleteUser(int? userid)
    {
        var user = await _context.Users.FindAsync(userid);

        if (user == null)
        {
            return NotFound();
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool UserExists(int? userid)
    {
        return _context.Users.Any(e => e.UserId == userid);
    }
}