using Microsoft.AspNetCore.Mvc;
using ComponentsApi.Data;
using Microsoft.EntityFrameworkCore;


namespace ComponentsApi.Controllers;
[ApiController]
[Route("api/[controller]")]

public class LineController : ControllerBase
{
    private readonly AppDbContext _context;
    public LineController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetLines([FromQuery] int projectId)
    {
        var lines = await _context.Lines
            .Where(l => l.ProjectId == projectId)
            .ToListAsync();       
        return Ok(lines);

    }
}