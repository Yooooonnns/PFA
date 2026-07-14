using Microsoft.AspNetCore.Mvc;
using ComponentsApi.Data;
using Microsoft.EntityFrameworkCore;
using ComponentsApi.DTOs;
using ComponentsApi.Models;


namespace ComponentsApi.Controllers;
[ApiController]
[Route("api/[controller]")]

public class RequestController : ControllerBase
{
    private readonly AppDbContext _context;
    public RequestController(AppDbContext context)
    {
        _context = context;
    }
    [HttpGet]
    public async Task<IActionResult> GetRequests([FromQuery] RequestStatus? status, [FromQuery] int? postId)
    {
        var query = _context.Requests
                .Include(r => r.PostComponent)
                    .ThenInclude(pc => pc.Component)
                .Include(r => r.PostComponent)
                        .ThenInclude(pc => pc.Post)
                            .ThenInclude(post => post.Line)
                                .ThenInclude(line => line.Project)
                .AsQueryable();
        if (status.HasValue)
            query = query.Where(r => r.Status == status.Value);
        if (postId.HasValue)
            query = query.Where(r => r.PostComponent.PostId == postId.Value);
        return Ok(await query.ToListAsync());
    }
        [HttpGet("consumption")]
    public async Task<IActionResult> GetIssuedRequests(
                        [FromQuery] DateTime? from,
                        [FromQuery] DateTime? to,
                        [FromQuery] int? projectId,
                        [FromQuery] int? lineId,
                        [FromQuery] int? postId)
    {
        var query = _context.Requests
                .Include(r => r.PostComponent)
                    .ThenInclude(pc => pc.Component)
                .Include(r => r.PostComponent)
                        .ThenInclude(pc => pc.Post)
                            .ThenInclude(post => post.Line)
                                .ThenInclude(line => line.Project)
                .Where(s =>s.Status == RequestStatus.Done);
        if (from.HasValue)
            query = query.Where(r=>r.IssuedAt >= from.Value);
        if (to.HasValue)
            query = query.Where(r => r.IssuedAt <= to.Value);
        if(projectId.HasValue)
            query = query.Where(r => r.PostComponent.Post.Line.Project.Id == projectId.Value );
        if(lineId.HasValue)
            query = query.Where(r=> r.PostComponent.Post.Line.Id == lineId.Value);
        if(postId.HasValue)
            query = query.Where(r => r.PostComponent.Post.Id == postId.Value);
        return Ok(await query
            .Select(r => new
            {
                r.Id,
                r.RequestedAt,
                r.IssuedAt,
                ComponentReference = r.PostComponent.Component.Reference,
                PostName = r.PostComponent.Post.Name,
                LineName = r.PostComponent.Post.Line.Name,
                ProjectName = r.PostComponent.Post.Line.Project.Name,
                r.Status
            })
        
        .ToListAsync());
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> PatchRequest(int id, [FromBody]UpdateRequesDTO dto)
    {
        var patch = await _context.Requests.FindAsync(id);
        if(patch == null) return NotFound();
        patch.Status = dto.Status;
        if(dto.Status == RequestStatus.Done)
            patch.IssuedAt = DateTime.UtcNow;
        else if (dto.Status == RequestStatus.Cancelled)
            patch.CanceledAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return Ok(patch);
    }
    [HttpPost]
    public async Task<IActionResult> PostRequest([FromBody] CreateRequestDTO dto)
    {
        var command = new Request { PostComponentId = dto.PostComponentId };
        _context.Requests.Add(command);
        await _context.SaveChangesAsync();
        return Ok(command);
    }

    // Delivers a bundle: marks each item Done or NoStock.
    // NoStock items automatically get a new pending request so they carry over.
    [HttpPost("bundle")]
    public async Task<IActionResult> DeliverBundle([FromBody] BundleDeliverDTO dto)
    {
        foreach (var item in dto.Items)
        {
            var request = await _context.Requests.FindAsync(item.Id);
            if (request == null) continue;

            request.Status = item.Status;
            if (item.Status == RequestStatus.Done)
                request.IssuedAt = DateTime.UtcNow;
            else if (item.Status == RequestStatus.Cancelled)
                request.CanceledAt = DateTime.UtcNow;
            else if (item.Status == RequestStatus.NoStock)
                _context.Requests.Add(new Request { PostComponentId = request.PostComponentId });
        }
        await _context.SaveChangesAsync();
        return Ok();
    }

    public record BundleDeliverDTO(List<BundleItem> Items);
    public record BundleItem(int Id, RequestStatus Status);
}
