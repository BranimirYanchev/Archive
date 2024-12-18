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
app.MapPost("/api/register", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var requestBody = await reader.ReadToEndAsync();

    // Parse the JSON dynamically
    var json = JsonDocument.Parse(requestBody);
    string email = json.RootElement.GetProperty("email").GetString();
    string password = json.RootElement.GetProperty("password").GetString();
    string repeatedPassword = json.RootElement.GetProperty("repeatedPassword").ToString();
    string firstName = json.RootElement.GetProperty("firstName").ToString();
    string lastName = json.RootElement.GetProperty("lastName").ToString();

    CheckRegisterData data = new CheckRegisterData("", email, firstName, lastName, password, repeatedPassword);

    // Let ASP.NET handle serialization
    return data.Message();
});

app.MapPost("/api/login", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var requestBody = await reader.ReadToEndAsync();

    // Parse the JSON dynamically
    var json = JsonDocument.Parse(requestBody);
    string email = json.RootElement.GetProperty("email").GetString();
    string password = json.RootElement.GetProperty("password").GetString();

    CheckLoginData data = new CheckLoginData(email, password);

    // Let ASP.NET handle serialization
    return data.Message();
});

app.Run();
