using Microsoft.AspNetCore.Mvc;
using ComponentsApi.Data;
using Microsoft.EntityFrameworkCore;

namespace ComponentsApi.Controllers;
[ApiController]
[Route("api/[controller]")]
public class ProjectController : ControllerBase
{
    private readonly AppDbContext _context;
    public ProjectController(AppDbContext context)
    {
        _context = context;
    }
    [HttpGet]
    public async Task<IActionResult> GetProjects()
    {
        var projects = await _context.Projects.Include(p=>p.Lines).ToListAsync();
        return Ok(projects);
    }
}
  
