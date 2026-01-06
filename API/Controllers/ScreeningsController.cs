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
    public class ScreeningsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;

        public ScreeningsController(ApplicationDbContext db, UserManager<ApplicationUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        // GET /api/screenings - List all screenings
        [HttpGet]
        public async Task<ActionResult<List<ScreeningDto>>> GetAllScreenings()
        {
            var screenings = await _db.Screenings
                .Include(s => s.Cinema)
                .Include(s => s.SeatReservations)
                .OrderBy(s => s.StartDateTime)
                .Select(s => new ScreeningDto
                {
                    Id = s.Id,
                    FilmTitle = s.FilmTitle,
                    CinemaId = s.CinemaId,
                    CinemaName = s.Cinema.Name,
                    StartDateTime = s.StartDateTime,
                    Rows = s.Cinema.Rows,
                    SeatsPerRow = s.Cinema.SeatsPerRow,
                    ReservationCount = s.SeatReservations.Count
                })
                .ToListAsync();

            return Ok(screenings);
        }

        // GET /api/screenings/{id} - Get screening with seat status
        [HttpGet("{id}")]
        public async Task<ActionResult<ScreeningDetailDto>> GetScreening(int id)
        {
            var screening = await _db.Screenings
                .Include(s => s.Cinema)
                .Include(s => s.SeatReservations)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (screening == null)
            {
                return NotFound(new { message = "Screening not found" });
            }

            var currentUserId = _userManager.GetUserId(User);

            // Build seat status for the entire room
            var seats = new List<SeatStatusDto>();
            for (int row = 1; row <= screening.Cinema.Rows; row++)
            {
                for (int seat = 1; seat <= screening.Cinema.SeatsPerRow; seat++)
                {
                    var reservation = screening.SeatReservations
                        .FirstOrDefault(r => r.RowNumber == row && r.SeatNumber == seat);

                    seats.Add(new SeatStatusDto
                    {
                        Row = row,
                        Seat = seat,
                        IsReserved = reservation != null,
                        IsOwnedByCurrentUser = reservation?.UserId == currentUserId
                    });
                }
            }

            return Ok(new ScreeningDetailDto
            {
                Id = screening.Id,
                FilmTitle = screening.FilmTitle,
                CinemaId = screening.CinemaId,
                CinemaName = screening.Cinema.Name,
                StartDateTime = screening.StartDateTime,
                Rows = screening.Cinema.Rows,
                SeatsPerRow = screening.Cinema.SeatsPerRow,
                Seats = seats
            });
        }

        // POST /api/screenings - Create screening (Admin only)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ScreeningDto>> CreateScreening([FromBody] CreateScreeningRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var cinema = await _db.Cinemas.FindAsync(request.CinemaId);
            if (cinema == null)
            {
                return BadRequest(new { message = "Selected cinema not found" });
            }

            var screening = new Screening
            {
                CinemaId = request.CinemaId,
                FilmTitle = request.FilmTitle,
                StartDateTime = request.StartDateTime
            };

            _db.Screenings.Add(screening);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetScreening), new { id = screening.Id }, new ScreeningDto
            {
                Id = screening.Id,
                FilmTitle = screening.FilmTitle,
                CinemaId = cinema.Id,
                CinemaName = cinema.Name,
                StartDateTime = screening.StartDateTime,
                Rows = cinema.Rows,
                SeatsPerRow = cinema.SeatsPerRow,
                ReservationCount = 0
            });
        }

        // DELETE /api/screenings/{id} - Delete screening (Admin only, cascades reservations)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteScreening(int id)
        {
            var screening = await _db.Screenings
                .Include(s => s.SeatReservations)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (screening == null)
            {
                return NotFound(new { message = "Screening not found" });
            }

            var filmTitle = screening.FilmTitle;
            var reservationCount = screening.SeatReservations.Count;

            // Cascade delete is handled by EF configuration
            _db.Screenings.Remove(screening);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = $"Screening '{filmTitle}' deleted successfully. {reservationCount} reservations were removed."
            });
        }
    }
}
