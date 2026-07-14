namespace ComponentsApi.Models
{
    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public ICollection<Line> Lines { get; set; } = new List<Line>();
    }
}
