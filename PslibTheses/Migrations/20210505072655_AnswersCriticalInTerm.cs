using Microsoft.EntityFrameworkCore.Migrations;

namespace PslibTheses.Migrations
{
    public partial class AnswersCriticalInTerm : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CriticalInTerm",
                table: "SetAnswers",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CriticalInTerm",
                table: "SetAnswers");
        }
    }
}
