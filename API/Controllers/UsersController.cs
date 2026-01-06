using CinemaTicketSystemCore.API.DTOs;
using CinemaTicketSystemCore.Data;
using CinemaTicketSystemCore.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CinemaTicketSystemCore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;

        public UsersController(ApplicationDbContext db, UserManager<ApplicationUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        // GET /api/users - Admin only
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<UserDto>>> GetAllUsers()
        {
            var users = await _db.Users.OrderBy(u => u.Email).ToListAsync();
            var adminRoleId = await _db.Roles
                .Where(r => r.Name == "Admin")
                .Select(r => r.Id)
                .FirstOrDefaultAsync();

            var adminUserIds = new HashSet<string>();
            if (!string.IsNullOrEmpty(adminRoleId))
            {
                adminUserIds = (await _db.UserRoles
                    .Where(ur => ur.RoleId == adminRoleId)
                    .Select(ur => ur.UserId)
                    .ToListAsync())
                    .ToHashSet();
            }

            var userDtos = users.Select(u => new UserDto
            {
                Id = u.Id,
                Email = u.Email ?? string.Empty,
                Name = u.Name,
                Surname = u.Surname,
                PhoneNumber = u.PhoneNumber,
                IsAdmin = adminUserIds.Contains(u.Id),
                LockVersion = u.LockVersion
            }).ToList();

            return Ok(userDtos);
        }

        // GET /api/users/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(string id)
        {
            var currentUserId = _userManager.GetUserId(User);
            var isAdmin = User.IsInRole("Admin");

            // Non-admins can only view their own profile
            if (!isAdmin && id != currentUserId)
            {
                return Forbid();
            }

            var user = await _db.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var userIsAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            return Ok(new UserDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                Name = user.Name,
                Surname = user.Surname,
                PhoneNumber = user.PhoneNumber,
                IsAdmin = userIsAdmin,
                LockVersion = user.LockVersion
            });
        }

        // PUT /api/users/{id} - With optimistic concurrency control
        [HttpPut("{id}")]
        public async Task<ActionResult<UserDto>> UpdateUser(string id, [FromBody] UserUpdateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var currentUserId = _userManager.GetUserId(User);
            var isAdmin = User.IsInRole("Admin");

            // Non-admins can only edit their own profile
            if (!isAdmin && id != currentUserId)
            {
                return Forbid();
            }

            var user = await _db.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Prevent admins from editing other admins
            if (isAdmin && id != currentUserId)
            {
                var targetIsAdmin = await _userManager.IsInRoleAsync(user, "Admin");
                if (targetIsAdmin)
                {
                    return Forbid();
                }
            }

            try
            {
                // Set original LockVersion for concurrency check
                if (request.LockVersion != null)
                {
                    _db.Entry(user).Property(u => u.LockVersion).OriginalValue = request.LockVersion;
                }

                user.Name = request.Name;
                user.Surname = request.Surname;
                user.PhoneNumber = request.PhoneNumber;

                _db.Entry(user).State = EntityState.Modified;
                await _db.SaveChangesAsync();

                var userIsAdmin = await _userManager.IsInRoleAsync(user, "Admin");
                return Ok(new UserDto
                {
                    Id = user.Id,
                    Email = user.Email ?? string.Empty,
                    Name = user.Name,
                    Surname = user.Surname,
                    PhoneNumber = user.PhoneNumber,
                    IsAdmin = userIsAdmin,
                    LockVersion = user.LockVersion
                });
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new { message = "This user was modified by another user. Please refresh and try again." });
            }
        }

        // DELETE /api/users/{id} - Admin only, handles parallel deletion
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteUser(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { message = "Invalid user ID" });
            }

            // Reload user - handles parallel deletion scenario
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
            {
                // User already deleted by another admin
                return NotFound(new { message = "User was already deleted by another administrator." });
            }

            // Cannot delete self
            var currentUserId = _userManager.GetUserId(User);
            if (id == currentUserId)
            {
                return BadRequest(new { message = "Cannot delete your own account" });
            }

            // Cannot delete other admins
            var targetIsAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            if (targetIsAdmin)
            {
                return Forbid();
            }

            // Remove user's reservations first (FK constraint)
            var reservations = _db.SeatReservations.Where(r => r.UserId == id);
            _db.SeatReservations.RemoveRange(reservations);
            await _db.SaveChangesAsync();

            // Delete user using UserManager
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });
            }

            return Ok(new { message = $"User '{user.Email}' deleted successfully" });
        }
    }
}
