using FinanceTrackerApp;
using FinanceTrackerApp.Models;
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

    // GET: api/User
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUser()
    {
        return await _context.Users.ToListAsync();
    }

    // GET: api/User/5
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

    // PUT: api/User/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
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

    // POST: api/User
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<User>> PostUser(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetUser", new { userid = user.UserId }, user);
    }

    // POST: api/Users/login
    [HttpPost("login")]
    public async Task<IActionResult> Login(FinanceTrackerApp.LoginModel login)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u =>
            u.Email == login.Email &&
            u.PasswordHash == login.PasswordHash);

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "Invalid Email or Password"
            });
        }

        return Ok(new
        {
            message = "Login Successful",
            user
        });
    }

    // DELETE: api/User/5
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
