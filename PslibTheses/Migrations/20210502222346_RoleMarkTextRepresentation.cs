using Microsoft.EntityFrameworkCore.Migrations;

namespace PslibTheses.Migrations
{
    public partial class RoleMarkTextRepresentation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkEvaluation_SetAnswers_SetAnswerId",
                table: "WorkEvaluation");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkEvaluation_SetQuestions_SetQuestionId",
                table: "WorkEvaluation");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkEvaluation_Users_CreatedById",
                table: "WorkEvaluation");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkEvaluation_Works_WorkId",
                table: "WorkEvaluation");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkNote_Users_CreatedById",
                table: "WorkNote");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkNote_Works_WorkId",
                table: "WorkNote");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WorkNote",
                table: "WorkNote");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WorkEvaluation",
                table: "WorkEvaluation");

            migrationBuilder.RenameTable(
                name: "WorkNote",
                newName: "WorkNotes");

            migrationBuilder.RenameTable(
                name: "WorkEvaluation",
                newName: "WorkEvaluations");

            migrationBuilder.RenameIndex(
                name: "IX_WorkNote_WorkId",
                table: "WorkNotes",
                newName: "IX_WorkNotes_WorkId");

            migrationBuilder.RenameIndex(
                name: "IX_WorkNote_CreatedById",
                table: "WorkNotes",
                newName: "IX_WorkNotes_CreatedById");

            migrationBuilder.RenameIndex(
                name: "IX_WorkEvaluation_SetQuestionId",
                table: "WorkEvaluations",
                newName: "IX_WorkEvaluations_SetQuestionId");

            migrationBuilder.RenameIndex(
                name: "IX_WorkEvaluation_SetAnswerId",
                table: "WorkEvaluations",
                newName: "IX_WorkEvaluations_SetAnswerId");

            migrationBuilder.RenameIndex(
                name: "IX_WorkEvaluation_CreatedById",
                table: "WorkEvaluations",
                newName: "IX_WorkEvaluations_CreatedById");

            migrationBuilder.AlterColumn<string>(
                name: "Mark",
                table: "WorkRoles",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<double>(
                name: "MarkValue",
                table: "WorkRoles",
                type: "float",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_WorkNotes",
                table: "WorkNotes",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WorkEvaluations",
                table: "WorkEvaluations",
                columns: new[] { "WorkId", "SetQuestionId" });

            migrationBuilder.AddForeignKey(
                name: "FK_WorkEvaluations_SetAnswers_SetAnswerId",
                table: "WorkEvaluations",
                column: "SetAnswerId",
                principalTable: "SetAnswers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkEvaluations_SetQuestions_SetQuestionId",
                table: "WorkEvaluations",
                column: "SetQuestionId",
                principalTable: "SetQuestions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkEvaluations_Users_CreatedById",
                table: "WorkEvaluations",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkEvaluations_Works_WorkId",
                table: "WorkEvaluations",
                column: "WorkId",
                principalTable: "Works",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkNotes_Users_CreatedById",
                table: "WorkNotes",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkNotes_Works_WorkId",
                table: "WorkNotes",
                column: "WorkId",
                principalTable: "Works",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkEvaluations_SetAnswers_SetAnswerId",
                table: "WorkEvaluations");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkEvaluations_SetQuestions_SetQuestionId",
                table: "WorkEvaluations");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkEvaluations_Users_CreatedById",
                table: "WorkEvaluations");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkEvaluations_Works_WorkId",
                table: "WorkEvaluations");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkNotes_Users_CreatedById",
                table: "WorkNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkNotes_Works_WorkId",
                table: "WorkNotes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WorkNotes",
                table: "WorkNotes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WorkEvaluations",
                table: "WorkEvaluations");

            migrationBuilder.DropColumn(
                name: "MarkValue",
                table: "WorkRoles");

            migrationBuilder.RenameTable(
                name: "WorkNotes",
                newName: "WorkNote");

            migrationBuilder.RenameTable(
                name: "WorkEvaluations",
                newName: "WorkEvaluation");

            migrationBuilder.RenameIndex(
                name: "IX_WorkNotes_WorkId",
                table: "WorkNote",
                newName: "IX_WorkNote_WorkId");

            migrationBuilder.RenameIndex(
                name: "IX_WorkNotes_CreatedById",
                table: "WorkNote",
                newName: "IX_WorkNote_CreatedById");

            migrationBuilder.RenameIndex(
                name: "IX_WorkEvaluations_SetQuestionId",
                table: "WorkEvaluation",
                newName: "IX_WorkEvaluation_SetQuestionId");

            migrationBuilder.RenameIndex(
                name: "IX_WorkEvaluations_SetAnswerId",
                table: "WorkEvaluation",
                newName: "IX_WorkEvaluation_SetAnswerId");

            migrationBuilder.RenameIndex(
                name: "IX_WorkEvaluations_CreatedById",
                table: "WorkEvaluation",
                newName: "IX_WorkEvaluation_CreatedById");

            migrationBuilder.AlterColumn<int>(
                name: "Mark",
                table: "WorkRoles",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_WorkNote",
                table: "WorkNote",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WorkEvaluation",
                table: "WorkEvaluation",
                columns: new[] { "WorkId", "SetQuestionId" });

            migrationBuilder.AddForeignKey(
                name: "FK_WorkEvaluation_SetAnswers_SetAnswerId",
                table: "WorkEvaluation",
                column: "SetAnswerId",
                principalTable: "SetAnswers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkEvaluation_SetQuestions_SetQuestionId",
                table: "WorkEvaluation",
                column: "SetQuestionId",
                principalTable: "SetQuestions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkEvaluation_Users_CreatedById",
                table: "WorkEvaluation",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkEvaluation_Works_WorkId",
                table: "WorkEvaluation",
                column: "WorkId",
                principalTable: "Works",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkNote_Users_CreatedById",
                table: "WorkNote",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkNote_Works_WorkId",
                table: "WorkNote",
                column: "WorkId",
                principalTable: "Works",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
