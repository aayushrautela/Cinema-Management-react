using CinemaTicketSystemCore.API.DTOs;
using CinemaTicketSystemCore.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace CinemaTicketSystemCore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponse
                {
                    Success = false,
                    Message = "Invalid registration data"
                });
            }

            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                EmailConfirmed = true,
                Name = request.Name,
                Surname = request.Surname,
                PhoneNumber = request.PhoneNumber,
                LockVersion = new byte[8]
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description);
                // Combine duplicate username/email errors
                if (result.Errors.Any(e => e.Code == "DuplicateUserName" || e.Code == "DuplicateEmail"))
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "This email address is already registered."
                    });
                }
                return BadRequest(new AuthResponse
                {
                    Success = false,
                    Message = string.Join("; ", errors)
                });
            }

            // Sign in after registration
            await _signInManager.SignInAsync(user, isPersistent: false);

            return Ok(new AuthResponse
            {
                Success = true,
                Message = "Registration successful",
                User = await MapUserToDto(user)
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponse
                {
                    Success = false,
                    Message = "Invalid login data"
                });
            }

            var result = await _signInManager.PasswordSignInAsync(
                request.Email,
                request.Password,
                request.RememberMe,
                lockoutOnFailure: false);

            if (!result.Succeeded)
            {
                return Unauthorized(new AuthResponse
                {
                    Success = false,
                    Message = "Invalid email or password"
                });
            }

            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return Unauthorized(new AuthResponse
                {
                    Success = false,
                    Message = "User not found"
                });
            }

            return Ok(new AuthResponse
            {
                Success = true,
                Message = "Login successful",
                User = await MapUserToDto(user)
            });
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<ActionResult<AuthResponse>> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok(new AuthResponse
            {
                Success = true,
                Message = "Logged out successfully"
            });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<AuthResponse>> GetCurrentUser()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new AuthResponse
                {
                    Success = false,
                    Message = "Not authenticated"
                });
            }

            return Ok(new AuthResponse
            {
                Success = true,
                User = await MapUserToDto(user)
            });
        }

        [HttpGet("check")]
        public async Task<ActionResult<AuthResponse>> CheckAuth()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Ok(new AuthResponse
                {
                    Success = false,
                    Message = "Not authenticated"
                });
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Ok(new AuthResponse
                {
                    Success = false,
                    Message = "User not found"
                });
            }

            return Ok(new AuthResponse
            {
                Success = true,
                User = await MapUserToDto(user)
            });
        }

        private async Task<UserDto> MapUserToDto(ApplicationUser user)
        {
            var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                Name = user.Name,
                Surname = user.Surname,
                PhoneNumber = user.PhoneNumber,
                IsAdmin = isAdmin,
                LockVersion = user.LockVersion
            };
        }
    }
}
