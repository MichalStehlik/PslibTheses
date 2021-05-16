using Microsoft.EntityFrameworkCore.Migrations;

namespace PslibTheses.Migrations
{
    public partial class WorkToWorkText : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MarkText",
                table: "WorkRoles",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MarkText",
                table: "WorkRoles");
        }
    }
}
