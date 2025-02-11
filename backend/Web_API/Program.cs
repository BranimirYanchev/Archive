using System.Runtime.InteropServices.JavaScript;
using System.Text.Json;
var builder = WebApplication.CreateBuilder(args);

string email = "";

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
    email = json.RootElement.GetProperty("email").GetString();
    string password = json.RootElement.GetProperty("password").GetString();
    string repeatedPassword = json.RootElement.GetProperty("repeatedPassword").ToString();
    string firstName = json.RootElement.GetProperty("firstName").ToString();
    string lastName = json.RootElement.GetProperty("lastName").ToString();
    string role = json.RootElement.GetProperty("userRole").ToString();
    string code = "";

    if (role == "teacher")
    {
        code = json.RootElement.GetProperty("code").ToString();
    }

    CheckRegisterData data = new CheckRegisterData(role, email, firstName, lastName, password, repeatedPassword, code);

    // Let ASP.NET handle serialization
    return data.Message();
});

app.MapPost("/api/login", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var requestBody = await reader.ReadToEndAsync();

    // Parse the JSON dynamically
    var json = JsonDocument.Parse(requestBody);
    email = json.RootElement.GetProperty("email").GetString();
    string password = json.RootElement.GetProperty("password").GetString();

    CheckLoginData data = new CheckLoginData(email, password);

    // Let ASP.NET handle serialization
    return data.Message();
});

app.MapPost("/api/register_teacher", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var requestBody = await reader.ReadToEndAsync();
});

app.UseStaticFiles(); // Enable serving static files

app.MapPost("/api/save_user_image", async (HttpContext context) =>
{
    var form = await context.Request.ReadFormAsync(); // Read form data
    var file = form.Files["file"]; // Get the uploaded file
    string id = form["id"].ToString();

    SaveImage saveImg = new SaveImage(file, id);

    return  saveImg.Message;
});

app.MapPost("/api/check_if_image_exists", async (HttpContext context) =>
{
    var form = await context.Request.ReadFormAsync(); // Read form data
    string id = form["id"];

    return new {url = new Database().GetProfileImgUrl(id)};
});

app.Run();