using Microsoft.AspNetCore.Mvc;
using ComponentsApi.Data;
using Microsoft.EntityFrameworkCore;

namespace ComponentsApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PostController : ControllerBase
{
    private readonly AppDbContext _context;
    public PostController(AppDbContext context)
    {
        _context = context;
    }
    [HttpGet]
    public async Task<IActionResult> GetPosts([FromQuery] int lineID)
    {
        var posts = await _context.Posts
            .Where(p => p.LineId == lineID)
            .ToListAsync();
        return Ok(posts);
    }

}
