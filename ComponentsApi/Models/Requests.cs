namespace ComponentsApi.Models
{
    public enum RequestStatus
    {
        Pending,
        Done,
        Cancelled,
        NoStock
    }

    public class Request
    {
        public int Id { get; set; }
        public RequestStatus Status { get; set; } = RequestStatus.Pending;
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? IssuedAt { get; set; }
        public DateTime? CanceledAt { get; set; }
        public int PostComponentId { get; set; }
        public PostComponent PostComponent { get; set; } = null!;


    }
}