using Microsoft.AspNetCore.Mvc;
using ComponentsApi.Data;
using Microsoft.EntityFrameworkCore;
using ComponentsApi.Models;

namespace ComponentsApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ComponentController : ControllerBase
{
    private readonly AppDbContext _context;
    public ComponentController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetComponents()
    {
        return Ok(await _context.Components.OrderBy(c => c.Reference).ToListAsync());
    }

    [HttpPost]
    public async Task<IActionResult> CreateComponent([FromBody] CreateComponentRequest dto)
    {
        var component = new Component { Reference = dto.Reference.Trim(), Category = dto.Category.Trim() };
        _context.Components.Add(component);
        await _context.SaveChangesAsync();
        return Ok(component);
    }

    public record CreateComponentRequest(string Reference, string Category);
}
