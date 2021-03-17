using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace PslibTheses.Migrations
{
    public partial class EvaluationRecords : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WorkEvaluations",
                columns: table => new
                {
                    WorkId = table.Column<int>(type: "int", nullable: false),
                    SetQuestionId = table.Column<int>(type: "int", nullable: false),
                    SetAnswerId = table.Column<int>(type: "int", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkEvaluation", x => new { x.WorkId, x.SetQuestionId });
                    table.ForeignKey(
                        name: "FK_WorkEvaluation_SetAnswers_SetAnswerId",
                        column: x => x.SetAnswerId,
                        principalTable: "SetAnswers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WorkEvaluation_SetQuestions_SetQuestionId",
                        column: x => x.SetQuestionId,
                        principalTable: "SetQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WorkEvaluation_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WorkEvaluation_Works_WorkId",
                        column: x => x.WorkId,
                        principalTable: "Works",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkNote",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkId = table.Column<int>(type: "int", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkNote", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkNote_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WorkNote_Works_WorkId",
                        column: x => x.WorkId,
                        principalTable: "Works",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkRoleQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkRoleId = table.Column<int>(type: "int", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkRoleQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkRoleQuestions_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WorkRoleQuestions_WorkRoles_WorkRoleId",
                        column: x => x.WorkRoleId,
                        principalTable: "WorkRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WorkEvaluation_CreatedById",
                table: "WorkEvaluation",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkEvaluation_SetAnswerId",
                table: "WorkEvaluation",
                column: "SetAnswerId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkEvaluation_SetQuestionId",
                table: "WorkEvaluation",
                column: "SetQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkNote_CreatedById",
                table: "WorkNote",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkNote_WorkId",
                table: "WorkNote",
                column: "WorkId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkRoleQuestions_CreatedById",
                table: "WorkRoleQuestions",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkRoleQuestions_WorkRoleId",
                table: "WorkRoleQuestions",
                column: "WorkRoleId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WorkEvaluation");

            migrationBuilder.DropTable(
                name: "WorkNote");

            migrationBuilder.DropTable(
                name: "WorkRoleQuestions");
        }
    }
}
