using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Companion.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedSkullKingGameDefinition : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "game_definitions",
                columns: new[]
                {
                    "Id",
                    "DisplayName",
                    "IsActive",
                    "MaxPlayers",
                    "MinPlayers",
                    "Slug",
                },
                values: new object[]
                {
                    new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
                    "Skull King",
                    true,
                    8,
                    2,
                    "skull-king",
                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "game_definitions",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890")
            );
        }
    }
}
