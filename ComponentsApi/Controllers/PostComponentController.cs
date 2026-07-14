    using ComponentsApi.DTOs;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.AspNetCore.Mvc;
    using ComponentsApi.Data;
using ComponentsApi.Models;



namespace ComponentsApi.Controllers;
    [ApiController]
    [Route("api/[controller]")]

    public class PostComponentController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PostComponentController(AppDbContext context)
        {
            _context = context;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetPostComponent(
                        [FromQuery] string qrcode                          
        )
        {   
            var pc = await _context.PostComponents
                .Include(p => p.Component)
                .Include(p => p.Post)
                    .ThenInclude(post => post.Line)
                        .ThenInclude(line =>line.Project)
                .Where(p => p.QRCode == qrcode)
                .FirstOrDefaultAsync();
            if(pc == null) return NotFound();
            else return Ok(pc);
        }
        [HttpGet("manage")]
        public async Task<IActionResult> GetQrManagement(
                        [FromQuery] int? projectId,
                        [FromQuery] int? lineId,
                        [FromQuery] int? postId)
        {
            var query = _context.PostComponents
            .Include(r => r.Component)
            .Include(r=>r.Post)
                .ThenInclude(p=>p.Line)
                    .ThenInclude(l=>l.Project)
            .AsQueryable();

            if(projectId.HasValue)
                query = query.Where(p=>p.Post.Line.ProjectId == projectId.Value);
            if(lineId.HasValue)
                query = query.Where(p=>p.Post.LineId == lineId.Value);
            if(postId.HasValue)
                query = query.Where(p=>p.PostId == postId.Value);
            return  Ok(await query.ToListAsync());    
        }
        [HttpPost]
        public async Task<IActionResult> PostComponent([FromBody]CreatePostComponent dto)
    {
        var pc = new PostComponent
        {
        QRCode = Guid.NewGuid().ToString(),
        PostId = dto.PostId, 
        ComponentId = dto.ComponentId,
        };
        _context.PostComponents.Add(pc);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPostComponent),new {id = pc.Id},pc);
    }
        [HttpDelete("{id}")]
        public async Task<IActionResult> deletePostComponent(int id)
    {
        var pc = await _context.PostComponents.FindAsync(id);
        if(pc == null) return NotFound();
         _context.PostComponents.Remove(pc);
        await _context.SaveChangesAsync();
        return NoContent();
    }
        [HttpPatch("{id}/regenerateQr")]
        public async Task<IActionResult> RegenerateQR(int id)
    {
       var pc = await _context.PostComponents.FindAsync(id);
       if(pc == null) return NotFound();
       pc.QRCode = Guid.NewGuid().ToString();
       await _context.SaveChangesAsync();
        return Ok(pc);
    }
    }