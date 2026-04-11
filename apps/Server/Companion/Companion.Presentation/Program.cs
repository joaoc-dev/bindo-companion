using Companion.Application.Sessions.Commands;
using Companion.Infrastructure;
using Companion.Presentation;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

var connectionString =
    builder.Configuration.GetConnectionString("companion")
    ?? throw new InvalidOperationException("Connection string 'companion' not found.");

builder.Services.AddInfrastructure(connectionString);

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(CreateSessionCommand).Assembly)
);

var app = builder.Build();

app.UseExceptionHandler();
app.MapOpenApi();
app.MapScalarApiReference();
app.MapCompanionEndpoints();
app.Run();
