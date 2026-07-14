using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComponentsApi.Migrations
{
    /// <inheritdoc />
    public partial class FixLineCasing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Lines_Projects_projectId",
                table: "Lines");

            migrationBuilder.RenameColumn(
                name: "projectId",
                table: "Lines",
                newName: "ProjectId");

            migrationBuilder.RenameIndex(
                name: "IX_Lines_projectId",
                table: "Lines",
                newName: "IX_Lines_ProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_Lines_Projects_ProjectId",
                table: "Lines",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Lines_Projects_ProjectId",
                table: "Lines");

            migrationBuilder.RenameColumn(
                name: "ProjectId",
                table: "Lines",
                newName: "projectId");

            migrationBuilder.RenameIndex(
                name: "IX_Lines_ProjectId",
                table: "Lines",
                newName: "IX_Lines_projectId");

            migrationBuilder.AddForeignKey(
                name: "FK_Lines_Projects_projectId",
                table: "Lines",
                column: "projectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
