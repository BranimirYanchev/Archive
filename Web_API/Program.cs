using System.Runtime.InteropServices.JavaScript;
using System.Text.Json;
using Mysqlx.Crud;
using Microsoft.Extensions.FileProviders;
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

string usersPath = Path.Combine("/var/data", "users");

// Проверяваме дали директорията съществува, ако не - създаваме я
if (!Directory.Exists(usersPath))
{
    Directory.CreateDirectory(usersPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        usersPath),
    RequestPath = "/users",
    ServeUnknownFileTypes = true
});


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


app.MapPost("/api/update_data", async (HttpContext context) =>
{
    var form = await context.Request.ReadFormAsync(); // Read form data
    string id = form["id"];

    UpdateUserRequest userRequest = new UpdateUserRequest();

    userRequest.FirstName = form["firstname"];
    userRequest.LastName = form["lastname"];
    userRequest.Description = form["description"];
    userRequest.Grade = form["grade"];
    userRequest.Email = form["email"];
    userRequest.OldPass = form["oldPass"];
    userRequest.Password = form["newPass"];
    userRequest.RepeatedPassword = form["repeatedPass"];

    return new UserController(id).UpdateUser(userRequest);
});

app.MapPost("/api/save_archive", async (HttpContext context) =>
{
    var form = await context.Request.ReadFormAsync(); // Read form data
    var image = form.Files.GetFile("image"); // Correct file retrieval

    var archive = new SaveArchive(
        form["title"],
        form["description"],
        form["category"],
        form["keywords"],
        form["email"],
        form["author"],
        image
    );

    var result = archive.SaveArchiveToJSON();
    return Results.Json(result); // Ensure a valid JSON response
});

app.MapPost("/api/update_archive", async (HttpContext context) =>
{
    var form = await context.Request.ReadFormAsync(); // Read form data
    string email = !string.IsNullOrEmpty(form["email"]) ? form["email"] : ""; 
    
    return new UpdateArchive(form["title"], form["description"], form["category"], form["keywords"], email, form["id"]).UpdateArchiveInJSON();
});

app.MapPost("/api/delete_archive", async (HttpContext context) =>
{
    var form = await context.Request.ReadFormAsync(); // Read form data
    string email = !string.IsNullOrEmpty(form["email"]) ? form["email"] : ""; 
    
    return new DeleteArchive().DeleteArchiveFromJSON(form["id"], email);
});

app.MapPost("/api/get_user_id", async (HttpContext context) =>
{
    var form = await context.Request.ReadFormAsync(); // Read form data
    string email = !string.IsNullOrEmpty(form["email"]) ? form["email"] : ""; 
    
    return new {id = new Database().GetCurrentUserID(email)};
});

app.MapGet("/api/get_last_user_id", async (HttpContext context) =>
{   
    return new {id = new Database().GetLastUserID()};
});

var pendingConfirmations = new ConcurrentDictionary<string, string>();

app.MapGet("/api/account/confirm-email", (string token, string email) =>
{
    if(token == "null" && email != "null"){
        return Results.Ok(new {isEmailConfirmed = new Database().CheckIfEmailIsVerified(email)});
    }

    if(new Database().CheckToken(token)){
        return Results.Ok(new {isEmailConfirmed = true});
    }else{
        return Results.BadRequest(new {isEmailConfirmed = false});
    }
});

app.MapGet("/api/account/send-new-email", async (string token, string email, HttpContext context) =>
{
    var database = new Database();

    if (database.CheckIfEmailIsVerified(email))
    {
        return Results.Ok(new { isEmailConfirmed = true });
    }

    if (database.CheckToken(token))
    {
        return Results.Ok(new { isEmailConfirmed = true });
    }

    string newToken = Guid.NewGuid().ToString();
    var emailService = context.RequestServices.GetRequiredService<EmailService>();
    await emailService.SendConfirmationEmailAsync(email, newToken);

    int userId = database.GetCurrentUserID(email);
    database.SaveToken(userId, newToken);

    return Results.Ok(new { isNewMessageSent = true });
});


app.Run();
