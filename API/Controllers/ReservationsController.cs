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
    public class ReservationsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;

        public ReservationsController(ApplicationDbContext db, UserManager<ApplicationUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        // GET /api/reservations/my - Get current user's reservations
        [HttpGet("my")]
        public async Task<ActionResult<List<ReservationDto>>> GetMyReservations()
        {
            var userId = _userManager.GetUserId(User);
            if (userId == null)
            {
                return Unauthorized();
            }

            var reservations = await _db.SeatReservations
                .Include(r => r.Screening)
                    .ThenInclude(s => s.Cinema)
                .Where(r => r.UserId == userId)
                .OrderBy(r => r.Screening.StartDateTime)
                .Select(r => new ReservationDto
                {
                    Id = r.Id,
                    ScreeningId = r.ScreeningId,
                    FilmTitle = r.Screening.FilmTitle,
                    CinemaName = r.Screening.Cinema.Name,
                    StartDateTime = r.Screening.StartDateTime,
                    RowNumber = r.RowNumber,
                    SeatNumber = r.SeatNumber,
                    ReservedAt = r.ReservedAt
                })
                .ToListAsync();

            return Ok(reservations);
        }

        // POST /api/reservations - Reserve a seat (with conflict handling)
        [HttpPost]
        public async Task<ActionResult<ReservationDto>> ReserveSeat([FromBody] CreateReservationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = _userManager.GetUserId(User);
            if (userId == null)
            {
                return Unauthorized();
            }

            var screening = await _db.Screenings
                .Include(s => s.Cinema)
                .FirstOrDefaultAsync(s => s.Id == request.ScreeningId);

            if (screening == null)
            {
                return NotFound(new { message = "Screening not found" });
            }

            // Validate seat coordinates
            if (request.RowNumber < 1 || request.RowNumber > screening.Cinema.Rows ||
                request.SeatNumber < 1 || request.SeatNumber > screening.Cinema.SeatsPerRow)
            {
                return BadRequest(new { message = "Invalid seat coordinates" });
            }

            // Check if seat is already reserved
            var existingReservation = await _db.SeatReservations
                .FirstOrDefaultAsync(sr =>
                    sr.ScreeningId == request.ScreeningId &&
                    sr.RowNumber == request.RowNumber &&
                    sr.SeatNumber == request.SeatNumber);

            if (existingReservation != null)
            {
                return Conflict(new { message = "This seat is already reserved" });
            }

            try
            {
                var reservation = new SeatReservation
                {
                    ScreeningId = request.ScreeningId,
                    UserId = userId,
                    RowNumber = request.RowNumber,
                    SeatNumber = request.SeatNumber,
                    ReservedAt = DateTime.Now
                };

                _db.SeatReservations.Add(reservation);
                await _db.SaveChangesAsync();

                return CreatedAtAction(nameof(GetMyReservations), null, new ReservationDto
                {
                    Id = reservation.Id,
                    ScreeningId = screening.Id,
                    FilmTitle = screening.FilmTitle,
                    CinemaName = screening.Cinema.Name,
                    StartDateTime = screening.StartDateTime,
                    RowNumber = reservation.RowNumber,
                    SeatNumber = reservation.SeatNumber,
                    ReservedAt = reservation.ReservedAt
                });
            }
            catch (DbUpdateException ex)
            {
                // Handle unique constraint violation (concurrent reservation)
                if (ex.InnerException != null &&
                    (ex.InnerException.Message.Contains("Duplicate entry") ||
                     ex.InnerException.Message.Contains("UNIQUE constraint")))
                {
                    return Conflict(new { message = "This seat was just reserved by another user. Please select a different seat." });
                }
                throw;
            }
        }

        // DELETE /api/reservations - Release a seat
        [HttpDelete]
        public async Task<ActionResult> ReleaseSeat([FromBody] ReleaseReservationRequest request)
        {
            var userId = _userManager.GetUserId(User);
            if (userId == null)
            {
                return Unauthorized();
            }

            var reservation = await _db.SeatReservations
                .FirstOrDefaultAsync(sr =>
                    sr.ScreeningId == request.ScreeningId &&
                    sr.RowNumber == request.RowNumber &&
                    sr.SeatNumber == request.SeatNumber &&
                    sr.UserId == userId);

            if (reservation == null)
            {
                return NotFound(new { message = "Reservation not found or you don't have permission to cancel it" });
            }

            _db.SeatReservations.Remove(reservation);
            await _db.SaveChangesAsync();

            return Ok(new { message = $"Seat {request.RowNumber}-{request.SeatNumber} reservation cancelled" });
        }

        // DELETE /api/reservations/screening/{screeningId} - Cancel all reservations for a screening
        [HttpDelete("screening/{screeningId}")]
        public async Task<ActionResult> CancelAllForScreening(int screeningId)
        {
            var userId = _userManager.GetUserId(User);
            if (userId == null)
            {
                return Unauthorized();
            }

            var reservations = await _db.SeatReservations
                .Where(sr => sr.ScreeningId == screeningId && sr.UserId == userId)
                .ToListAsync();

            if (!reservations.Any())
            {
                return NotFound(new { message = "No reservations found to cancel" });
            }

            var count = reservations.Count;
            _db.SeatReservations.RemoveRange(reservations);
            await _db.SaveChangesAsync();

            return Ok(new { message = $"{count} reservation(s) cancelled for this screening" });
        }
    }
}
