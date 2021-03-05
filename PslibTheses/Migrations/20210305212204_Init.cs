using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace PslibTheses.Migrations
{
    public partial class Init : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Scales",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Scales", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Targets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RGB = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Targets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MiddleName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Gender = table.Column<int>(type: "int", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CanBeAuthor = table.Column<bool>(type: "bit", nullable: false),
                    CanBeEvaluator = table.Column<bool>(type: "bit", nullable: false),
                    IconImage = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    IconImageType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LockedChange = table.Column<bool>(type: "bit", nullable: false),
                    LockedIcon = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ScaleValues",
                columns: table => new
                {
                    ScaleId = table.Column<int>(type: "int", nullable: false),
                    Rate = table.Column<double>(type: "float", nullable: false),
                    Mark = table.Column<double>(type: "float", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScaleValues", x => new { x.ScaleId, x.Rate });
                    table.ForeignKey(
                        name: "FK_ScaleValues_Scales_ScaleId",
                        column: x => x.ScaleId,
                        principalTable: "Scales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Sets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ScaleId = table.Column<int>(type: "int", nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    Template = table.Column<int>(type: "int", nullable: false),
                    RequiredGoals = table.Column<int>(type: "int", nullable: false),
                    RequiredOutlines = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sets_Scales_ScaleId",
                        column: x => x.ScaleId,
                        principalTable: "Scales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Ideas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Participants = table.Column<int>(type: "int", nullable: false),
                    UserId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Resources = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Subject = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Updated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ideas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ideas_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Ideas_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SetRoles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ClassTeacher = table.Column<bool>(type: "bit", nullable: false),
                    Manager = table.Column<bool>(type: "bit", nullable: false),
                    PrintedInApplication = table.Column<bool>(type: "bit", nullable: false),
                    PrintedInReview = table.Column<bool>(type: "bit", nullable: false),
                    SetId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SetRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SetRoles_Sets_SetId",
                        column: x => x.SetId,
                        principalTable: "Sets",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SetTerms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SetId = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false),
                    WarningDate = table.Column<DateTime>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SetTerms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SetTerms_Sets_SetId",
                        column: x => x.SetId,
                        principalTable: "Sets",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Works",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AuthorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClassName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ManagerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SetId = table.Column<int>(type: "int", nullable: false),
                    MaterialCosts = table.Column<int>(type: "int", nullable: false),
                    MaterialCostsProvidedBySchool = table.Column<int>(type: "int", nullable: false),
                    ServicesCosts = table.Column<int>(type: "int", nullable: false),
                    ServicesCostsProvidedBySchool = table.Column<int>(type: "int", nullable: false),
                    DetailExpenditures = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepositoryURL = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    State = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Resources = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Subject = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Updated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Works", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Works_Sets_SetId",
                        column: x => x.SetId,
                        principalTable: "Sets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Works_Users_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Works_Users_ManagerId",
                        column: x => x.ManagerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Works_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "IdeaGoals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdeaId = table.Column<int>(type: "int", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IdeaGoals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IdeaGoals_Ideas_IdeaId",
                        column: x => x.IdeaId,
                        principalTable: "Ideas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IdeaOffers",
                columns: table => new
                {
                    IdeaId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IdeaOffers", x => new { x.IdeaId, x.UserId });
                    table.ForeignKey(
                        name: "FK_IdeaOffers_Ideas_IdeaId",
                        column: x => x.IdeaId,
                        principalTable: "Ideas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_IdeaOffers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IdeaOutlines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdeaId = table.Column<int>(type: "int", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IdeaOutlines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IdeaOutlines_Ideas_IdeaId",
                        column: x => x.IdeaId,
                        principalTable: "Ideas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IdeaTargets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdeaId = table.Column<int>(type: "int", nullable: false),
                    TargetId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IdeaTargets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IdeaTargets_Ideas_IdeaId",
                        column: x => x.IdeaId,
                        principalTable: "Ideas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_IdeaTargets_Targets_TargetId",
                        column: x => x.TargetId,
                        principalTable: "Targets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SetQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Order = table.Column<int>(type: "int", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Points = table.Column<int>(type: "int", nullable: false),
                    SetTermId = table.Column<int>(type: "int", nullable: false),
                    SetRoleId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SetQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SetQuestions_SetRoles_SetRoleId",
                        column: x => x.SetRoleId,
                        principalTable: "SetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SetQuestions_SetTerms_SetTermId",
                        column: x => x.SetTermId,
                        principalTable: "SetTerms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkGoals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkId = table.Column<int>(type: "int", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkGoals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkGoals_Works_WorkId",
                        column: x => x.WorkId,
                        principalTable: "Works",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkOutlines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkId = table.Column<int>(type: "int", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkOutlines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkOutlines_Works_WorkId",
                        column: x => x.WorkId,
                        principalTable: "Works",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkRoles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkId = table.Column<int>(type: "int", nullable: false),
                    SetRoleId = table.Column<int>(type: "int", nullable: false),
                    Mark = table.Column<int>(type: "int", nullable: true),
                    Finalized = table.Column<bool>(type: "bit", nullable: false),
                    Review = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Updated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkRoles_SetRoles_SetRoleId",
                        column: x => x.SetRoleId,
                        principalTable: "SetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WorkRoles_Works_WorkId",
                        column: x => x.WorkId,
                        principalTable: "Works",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SetAnswers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    Critical = table.Column<bool>(type: "bit", nullable: false),
                    SetQuestionId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SetAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SetAnswers_SetQuestions_SetQuestionId",
                        column: x => x.SetQuestionId,
                        principalTable: "SetQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WorkRoleUsers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkRoleId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkRoleUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkRoleUsers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkRoleUsers_WorkRoles_WorkRoleId",
                        column: x => x.WorkRoleId,
                        principalTable: "WorkRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Scales",
                columns: new[] { "Id", "Name" },
                values: new object[] { 1, "Stará škála" });

            migrationBuilder.InsertData(
                table: "Targets",
                columns: new[] { "Id", "RGB", "Text" },
                values: new object[,]
                {
                    { 1, -256, "MP Lyceum" },
                    { 2, -23296, "RP Lyceum" },
                    { 3, -65536, "MP IT" },
                    { 4, -16776961, "MP Strojírenství" },
                    { 5, -16744448, "MP Elektrotechnika" }
                });

            migrationBuilder.InsertData(
                table: "ScaleValues",
                columns: new[] { "Rate", "ScaleId", "Mark", "Name" },
                values: new object[,]
                {
                    { 1.0, 1, 1.0, "Výborný" },
                    { 0.80000000000000004, 1, 2.0, "Chvalitebný" },
                    { 0.59999999999999998, 1, 3.0, "Dobrý" },
                    { 0.40000000000000002, 1, 4.0, "Dostatečný" },
                    { 0.20000000000000001, 1, 5.0, "Nedostatečný" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_IdeaGoals_IdeaId_Order",
                table: "IdeaGoals",
                columns: new[] { "IdeaId", "Order" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_IdeaOffers_UserId",
                table: "IdeaOffers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_IdeaOutlines_IdeaId_Order",
                table: "IdeaOutlines",
                columns: new[] { "IdeaId", "Order" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Ideas_UserId",
                table: "Ideas",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Ideas_UserId1",
                table: "Ideas",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_IdeaTargets_IdeaId_TargetId",
                table: "IdeaTargets",
                columns: new[] { "IdeaId", "TargetId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_IdeaTargets_TargetId",
                table: "IdeaTargets",
                column: "TargetId");

            migrationBuilder.CreateIndex(
                name: "IX_SetAnswers_SetQuestionId",
                table: "SetAnswers",
                column: "SetQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_SetQuestions_SetRoleId",
                table: "SetQuestions",
                column: "SetRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_SetQuestions_SetTermId",
                table: "SetQuestions",
                column: "SetTermId");

            migrationBuilder.CreateIndex(
                name: "IX_SetRoles_SetId",
                table: "SetRoles",
                column: "SetId");

            migrationBuilder.CreateIndex(
                name: "IX_Sets_ScaleId",
                table: "Sets",
                column: "ScaleId");

            migrationBuilder.CreateIndex(
                name: "IX_SetTerms_SetId",
                table: "SetTerms",
                column: "SetId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkGoals_WorkId",
                table: "WorkGoals",
                column: "WorkId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkOutlines_WorkId",
                table: "WorkOutlines",
                column: "WorkId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkRoles_SetRoleId",
                table: "WorkRoles",
                column: "SetRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkRoles_WorkId",
                table: "WorkRoles",
                column: "WorkId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkRoleUsers_UserId",
                table: "WorkRoleUsers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkRoleUsers_WorkRoleId",
                table: "WorkRoleUsers",
                column: "WorkRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Works_AuthorId",
                table: "Works",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_Works_ManagerId",
                table: "Works",
                column: "ManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_Works_SetId",
                table: "Works",
                column: "SetId");

            migrationBuilder.CreateIndex(
                name: "IX_Works_UserId",
                table: "Works",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IdeaGoals");

            migrationBuilder.DropTable(
                name: "IdeaOffers");

            migrationBuilder.DropTable(
                name: "IdeaOutlines");

            migrationBuilder.DropTable(
                name: "IdeaTargets");

            migrationBuilder.DropTable(
                name: "ScaleValues");

            migrationBuilder.DropTable(
                name: "SetAnswers");

            migrationBuilder.DropTable(
                name: "WorkGoals");

            migrationBuilder.DropTable(
                name: "WorkOutlines");

            migrationBuilder.DropTable(
                name: "WorkRoleUsers");

            migrationBuilder.DropTable(
                name: "Ideas");

            migrationBuilder.DropTable(
                name: "Targets");

            migrationBuilder.DropTable(
                name: "SetQuestions");

            migrationBuilder.DropTable(
                name: "WorkRoles");

            migrationBuilder.DropTable(
                name: "SetTerms");

            migrationBuilder.DropTable(
                name: "SetRoles");

            migrationBuilder.DropTable(
                name: "Works");

            migrationBuilder.DropTable(
                name: "Sets");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Scales");
        }
    }
}
