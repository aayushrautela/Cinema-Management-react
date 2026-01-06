using CinemaTicketSystemCore.API.DTOs;
using CinemaTicketSystemCore.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CinemaTicketSystemCore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CinemasController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public CinemasController(ApplicationDbContext db)
        {
            _db = db;
        }

        // GET /api/cinemas - List all cinemas
        [HttpGet]
        public async Task<ActionResult<List<CinemaDto>>> GetAllCinemas()
        {
            var cinemas = await _db.Cinemas
                .OrderBy(c => c.Name)
                .Select(c => new CinemaDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Rows = c.Rows,
                    SeatsPerRow = c.SeatsPerRow
                })
                .ToListAsync();

            return Ok(cinemas);
        }

        // GET /api/cinemas/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<CinemaDto>> GetCinema(int id)
        {
            var cinema = await _db.Cinemas.FindAsync(id);
            if (cinema == null)
            {
                return NotFound(new { message = "Cinema not found" });
            }

            return Ok(new CinemaDto
            {
                Id = cinema.Id,
                Name = cinema.Name,
                Rows = cinema.Rows,
                SeatsPerRow = cinema.SeatsPerRow
            });
        }
    }
}
