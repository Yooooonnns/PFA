namespace ComponentsApi.Models
{
    public class PostComponent
    {
        public int Id { get; set; }
        public string QRCode { get; set; } =  Guid.NewGuid().ToString();
        public int PostId { get; set; }
        public Post Post { get; set; } = null!;
        public int ComponentId { get; set; }
        public Component Component { get; set; } = null!;
        
    }
}