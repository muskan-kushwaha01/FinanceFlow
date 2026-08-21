using FinanceTrackerApp.DTO.Profile;
using FinanceTrackerApp.DTOs;
using FinanceTrackerApp.DTOs.ResetPassword;
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
    // GET: api/Users/profile/5
    [HttpGet("profile/{userid}")]
    public async Task<ActionResult<UserProfileDTO>> GetProfile(int userid)
    {
        var user = await _context.Users
            .Where(u => u.UserId == userid)
            .Select(u => new UserProfileDTO
            {
                UserId = u.UserId,
                FullName = u.FullName,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                DateOfBirth = u.DateOfBirth,
                Gender = u.Gender
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }
    // PUT: api/Users/profile/5
    [HttpPut("profile/{userid}")]
    public async Task<IActionResult> UpdateProfile(
        int userid,
        UserProfileDTO profile)
    {
        if (userid != profile.UserId)
        {
            return BadRequest();
        }

        var user = await _context.Users.FindAsync(userid);

        if (user == null)
        {
            return NotFound();
        }

        user.FullName = profile.FullName;
        user.PhoneNumber = profile.PhoneNumber;
        user.DateOfBirth = profile.DateOfBirth;
        user.Gender = profile.Gender;
        user.UpdatedAt = DateTime.Now;

        await _context.SaveChangesAsync();

        return NoContent();
    }
    // PUT: api/Users/change-password
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDTO request)
    {
        var user = await _context.Users.FindAsync(request.UserId);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        var passwordHasher = new PasswordHasher<User>();

        var passwordResult = passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.CurrentPassword
        );

        if (passwordResult == PasswordVerificationResult.Failed)
        {
            return BadRequest(new
            {
                message = "Current password is incorrect."
            });
        }

        user.PasswordHash = passwordHasher.HashPassword(
            user,
            request.NewPassword
        );

        user.UpdatedAt = DateTime.Now;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Password changed successfully."
        });
    }

    // PUT: api/Users/reset-password
    [HttpPut("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
        {
            return NotFound(new
            {
                message = "No account found with this email address."
            });
        }

        var passwordHasher = new PasswordHasher<User>();

        user.PasswordHash = passwordHasher.HashPassword(
            user,
            request.NewPassword
        );

        user.UpdatedAt = DateTime.Now;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Password reset successfully."
        });
    }

    // POST: api/Users/register
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto register)
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