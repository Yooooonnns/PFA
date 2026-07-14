namespace ComponentsApi.Data;
using ComponentsApi.Models;
using Microsoft.EntityFrameworkCore;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
        
    }
    public DbSet<Post> Posts { get; set; } = null!;
    public DbSet<Line> Lines { get; set; } = null!;
    public DbSet<Component> Components { get; set; } = null!;
    public DbSet<Project> Projects { get; set; } = null!;
    public DbSet<PostComponent> PostComponents { get; set; } = null!;
    public DbSet<Request> Requests { get; set; } = null!;
}