using System.ComponentModel.DataAnnotations;

namespace CinemaTicketSystemCore.API.DTOs
{
    public class ScreeningDto
    {
        public int Id { get; set; }
        public string FilmTitle { get; set; } = string.Empty;
        public int CinemaId { get; set; }
        public string CinemaName { get; set; } = string.Empty;
        public DateTime StartDateTime { get; set; }
        public int Rows { get; set; }
        public int SeatsPerRow { get; set; }
        public int ReservationCount { get; set; }
    }

    public class CreateScreeningRequest
    {
        [Required]
        public int CinemaId { get; set; }

        [Required]
        [StringLength(200)]
        public string FilmTitle { get; set; } = string.Empty;

        [Required]
        public DateTime StartDateTime { get; set; }
    }

    public class ScreeningDetailDto
    {
        public int Id { get; set; }
        public string FilmTitle { get; set; } = string.Empty;
        public int CinemaId { get; set; }
        public string CinemaName { get; set; } = string.Empty;
        public DateTime StartDateTime { get; set; }
        public int Rows { get; set; }
        public int SeatsPerRow { get; set; }
        public List<SeatStatusDto> Seats { get; set; } = new();
    }

    public class SeatStatusDto
    {
        public int Row { get; set; }
        public int Seat { get; set; }
        public bool IsReserved { get; set; }
        public bool IsOwnedByCurrentUser { get; set; }
    }
}
