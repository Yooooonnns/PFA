namespace ComponentsApi.Models
{
    public class Post
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int LineId{get;set;}
        public Line Line{get;set;} = null!;
    }
}

