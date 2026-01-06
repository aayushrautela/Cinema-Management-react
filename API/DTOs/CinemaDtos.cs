namespace CinemaTicketSystemCore.API.DTOs
{
    public class CinemaDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Rows { get; set; }
        public int SeatsPerRow { get; set; }
        public int TotalSeats => Rows * SeatsPerRow;
    }
}
