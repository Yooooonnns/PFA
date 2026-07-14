using ComponentsApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ComponentsApi.Data;

public static class SeedData
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Projects.AnyAsync()) return; // already seeded

        var projects = new Dictionary<string, string[]>
        {
            ["Cherry"] = ["Cherry Floor"],
            ["DPE"]    = ["HABITACLE 1","HABITACLE 2","HABITACLE 3","HABITACLE EP512","MAIN EP512","MAIN L1","MAIN L2","MAIN L3","PDB 1"],
            ["ECMP"]   = ["BMS STIPE 2","Cable charge HV STAPE 2","Fsc mot eK0","High Voltage","Low Voltage L1","Low Voltage L2","Moteur STEP 2","PILOTAGE STIPE 2 L1","PILOTAGE STIPE 2 L2","SMALLS eK0","ECMP SMALLS L1","SMALLS STAPE 2","SMALLS STEP 2 Flux1","SMALLS STEP 2 High Voltage"],
            ["EDPEO"]  = ["BMU Gene2","Smalls Flux 3","Smalls Flux 4"],
            ["EK0"]    = ["Tous les equipements_Sep-Int"],
            ["EK9"]    = ["BMS L1","Cable de Charge L1","DAISY L1","Fsc mot L1","SMALLS L1"],
            ["K0"]     = ["HABITACLE 1 K0","HABITACLE 2 K0","HABITACLE 3 K0","IP Line 01","IP Line 02","MAIN L1 K0","MAIN L2 K0","MAIN L3 K0"],
            ["XJX"]    = ["MBLOC L1","MBLOC L2","MBLOC L3","MBLOC L4","MBLOC L5","PH2","PORTE ARR L1","SMALLS Shunt hayon/water","Vide poche"],
            ["ALL"]    = ["Projet L01","TRAINING","Traction-pre-assy C-TEC POS 24","YAESU Nr_2ED-3219"],
        };

        var lineCache = new Dictionary<string, Line>();

        foreach (var (projectName, lines) in projects)
        {
            var project = new Project { Name = projectName };
            db.Projects.Add(project);
            await db.SaveChangesAsync();

            foreach (var lineName in lines)
            {
                var line = new Line { Name = lineName, ProjectId = project.Id };
                db.Lines.Add(line);
                await db.SaveChangesAsync();
                lineCache[$"{projectName}::{lineName}"] = line;
            }
        }

        // Posts + components for DPE / HABITACLE 3
        var hab3 = lineCache["DPE::HABITACLE 3"];

        var posts = new[]
        {
            ("SPS2",  new[] { "C230 7287 4314 80" }),
            ("SPS3A", new[] { "C158 7271 2283 30", "C77 7271 2283 30", "C214 7271 2283 30" }),
            ("SPS4",  new[] { "C230 7287 4314 80", "C94 7287 4314 80", "C3 7287 4314 80" }),
        };

        var componentCache = new Dictionary<string, Component>();

        foreach (var (postName, refs) in posts)
        {
            var post = new Post { Name = postName, LineId = hab3.Id };
            db.Posts.Add(post);
            await db.SaveChangesAsync();

            foreach (var reference in refs)
            {
                if (!componentCache.TryGetValue(reference, out var component))
                {
                    component = new Component { Reference = reference, Category = "" };
                    db.Components.Add(component);
                    await db.SaveChangesAsync();
                    componentCache[reference] = component;
                }

                db.PostComponents.Add(new PostComponent
                {
                    PostId = post.Id,
                    ComponentId = component.Id,
                    QRCode = Guid.NewGuid().ToString()
                });
            }
        }

        await db.SaveChangesAsync();
        Console.WriteLine("Database seeded.");
    }
}
