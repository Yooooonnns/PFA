namespace ComponentsApi.Models
{
    public class Component
    {
        public int Id { get; set; }
        public string Reference { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
    }
}