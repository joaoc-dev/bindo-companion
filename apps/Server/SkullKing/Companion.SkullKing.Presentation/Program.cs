using Companion.SkullKing.Application.Commands;
using Companion.SkullKing.Infrastructure;
using Companion.SkullKing.Presentation;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

var mongoConnectionString =
    builder.Configuration.GetConnectionString("skull-king-mongo")
    ?? throw new InvalidOperationException("Connection string 'skull-king-mongo' not found.");

builder.Services.AddSkullKing(mongoConnectionString);

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(InitializeSkullKingMatchCommand).Assembly)
);

var app = builder.Build();

app.UseExceptionHandler();
app.MapOpenApi();
app.MapScalarApiReference();
app.MapSkullKingEndpoints();
app.Run();
