using Microsoft.AspNetCore.Mvc;
using ComponentsApi.Data;
using Microsoft.EntityFrameworkCore;
using ComponentsApi.Models;
using ClosedXML.Excel;


namespace ComponentsApi.Controllers;
[ApiController]
[Route("api/[controller]")]

public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;
    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    // Excel format: Col1=Project, Col2=Line, Col3=Post, Col4=ComponentRef, Col5=Category(optional)
    [HttpPost]
    public async Task<IActionResult> ImportExcelFile([FromForm] IFormFile file)
    {
        using var workbook = new XLWorkbook(file.OpenReadStream());
        var sheet = workbook.Worksheet(1);
        var rows = sheet.RowsUsed().Skip(1);
        int imported = 0;

        foreach (var row in rows)
        {
            var projectName = row.Cell(1).GetValue<string>().Trim();
            var lineName = row.Cell(2).GetValue<string>().Trim();
            var postName = row.Cell(3).GetValue<string>().Trim();
            var componentRef = row.Cell(4).GetValue<string>().Trim();
            var componentCategory = row.Cell(5).GetValue<string>().Trim();

            if (string.IsNullOrEmpty(projectName) || string.IsNullOrEmpty(componentRef)) continue;

            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Name == projectName);
            if (project == null)
            {
                project = new Project { Name = projectName };
                _context.Projects.Add(project);
                await _context.SaveChangesAsync();
            }

            var line = await _context.Lines.FirstOrDefaultAsync(l => l.Name == lineName && l.ProjectId == project.Id);
            if (line == null)
            {
                line = new Line { Name = lineName, ProjectId = project.Id };
                _context.Lines.Add(line);
                await _context.SaveChangesAsync();
            }

            var post = await _context.Posts.FirstOrDefaultAsync(p => p.Name == postName && p.LineId == line.Id);
            if (post == null)
            {
                post = new Post { Name = postName, LineId = line.Id };
                _context.Posts.Add(post);
                await _context.SaveChangesAsync();
            }

            var component = await _context.Components.FirstOrDefaultAsync(c => c.Reference == componentRef);
            if (component == null)
            {
                component = new Component { Reference = componentRef, Category = componentCategory };
                _context.Components.Add(component);
                await _context.SaveChangesAsync();
            }

            bool exists = await _context.PostComponents
                .AnyAsync(pc => pc.PostId == post.Id && pc.ComponentId == component.Id);
            if (exists) continue;

            _context.PostComponents.Add(new PostComponent
            {
                PostId = post.Id,
                ComponentId = component.Id,
                QRCode = Guid.NewGuid().ToString()
            });
            imported++;
        }

        await _context.SaveChangesAsync();
        return Ok(new { imported });
    }
}
