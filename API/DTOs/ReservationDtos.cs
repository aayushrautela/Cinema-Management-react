using System.ComponentModel.DataAnnotations;

namespace CinemaTicketSystemCore.API.DTOs
{
    public class ReservationDto
    {
        public int Id { get; set; }
        public int ScreeningId { get; set; }
        public string FilmTitle { get; set; } = string.Empty;
        public string CinemaName { get; set; } = string.Empty;
        public DateTime StartDateTime { get; set; }
        public int RowNumber { get; set; }
        public int SeatNumber { get; set; }
        public DateTime ReservedAt { get; set; }
    }

    public class CreateReservationRequest
    {
        [Required]
        public int ScreeningId { get; set; }

        [Required]
        [Range(1, 50)]
        public int RowNumber { get; set; }

        [Required]
        [Range(1, 50)]
        public int SeatNumber { get; set; }
    }

    public class ReleaseReservationRequest
    {
        [Required]
        public int ScreeningId { get; set; }

        [Required]
        public int RowNumber { get; set; }

        [Required]
        public int SeatNumber { get; set; }
    }
}
