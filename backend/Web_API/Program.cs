using System.Runtime.InteropServices.JavaScript;
using System.Text.Json;
var builder = WebApplication.CreateBuilder(args);

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin() // Allow requests from any origin
              .AllowAnyMethod() // Allow all HTTP methods (GET, POST, etc.)
              .AllowAnyHeader(); // Allow any headers in the request
    });
});

var app = builder.Build();

// Enable CORS globally
app.UseCors("AllowAll");

// Define API endpoints
app.MapGet("/api/greet", () => new { message = "MAMA MU DEEBa"});
app.MapPost("/api/echo", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var requestBody = await reader.ReadToEndAsync();

    // Parse the JSON dynamically
    var json = JsonDocument.Parse(requestBody);
    string email = json.RootElement.GetProperty("email").GetString();
    string password = json.RootElement.GetProperty("password").GetString();

    CheckData data = new CheckData(email, password);

    // Let ASP.NET handle serialization
    return data.Message();
});

app.Run();
