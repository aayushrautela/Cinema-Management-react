using System.ComponentModel.DataAnnotations;

namespace CinemaTicketSystemCore.API.DTOs
{
    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public bool IsAdmin { get; set; }
        public byte[]? LockVersion { get; set; }
    }

    public class UserUpdateRequest
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Surname { get; set; } = string.Empty;

        [StringLength(20)]
        public string? PhoneNumber { get; set; }

        // For optimistic concurrency control
        public byte[]? LockVersion { get; set; }
    }
}
