using System.Runtime.InteropServices.JavaScript;
using System.Text.Json;
using Mysqlx.Crud;
using Microsoft.Extensions.FileProviders;
using System.Collections.Concurrent;
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

builder.Services.AddScoped<EmailService>();
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
    return await data.Message(context);
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

app.MapPost("/api/get_user_email", async (HttpContext context) =>
{
    var form = await context.Request.ReadFormAsync(); // Read form data
    string userId = form["userId"]; 

    string email = new Database().GetUserEmailById(userId);

    return Results.Ok(new {result = email});
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

    if(token == ""){
        await emailService.SendConfirmationEmailAsync(email, newToken);
        return Results.Ok(new { isNewMessageSent = true });
    }

    await emailService.SendConfirmationEmailAsync(email, newToken);

    int userId = database.GetCurrentUserID(email);
    database.SaveToken(userId, newToken, "email");

    return Results.Ok(new { isNewMessageSent = true });
});

app.MapGet("/api/administrator/get_users_data", async () =>
{
    var result = await new Administrator().GetUsersData();
    return Results.Ok(result);
});


app.MapPost("/api/administrator/hide_archive", async (HttpContext context) =>
{
    var request = await context.Request.ReadFromJsonAsync<HideArchiveRequest>();

    if (request == null || request.UserId == 0 || request.ArchiveId == 0)
    {
        return Results.BadRequest("Invalid data.");
    }

    return await new Administrator().HideOrShowArchive(request, "hidden");
});

app.MapPost("/api/administrator/show_archive", async (HttpContext context) =>
{
    var request = await context.Request.ReadFromJsonAsync<HideArchiveRequest>();

    if (request == null || request.UserId == 0 || request.ArchiveId == 0)
    {
        return Results.BadRequest("Invalid data.");
    }

    return await new Administrator().HideOrShowArchive(request, "");
});

app.MapPost("/api/administrator/delete-profile", (string userId) =>
{
    return Results.Ok(new { isProfileDeleted = new Database().DeleteProfile(userId)});
});

app.MapPost("/api/verify_log/create_token", async (HttpContext context) =>
{
    var body = await context.Request.ReadFromJsonAsync<Dictionary<string, JsonElement>>();

    if (body == null || !body.ContainsKey("userId"))
        return Results.BadRequest("Invalid data.");

    int userId = body["userId"].GetInt32();

    string token = Guid.NewGuid().ToString();
    var result = new Database().SaveToken(userId, token, "");

    return result != null
        ? Results.Ok(new { isTokenCreated = true, token = token })
        : Results.Ok(new { isTokenCreated = false });
});

app.MapPost("/api/verify_log/check_token", async (HttpContext context) =>
{
    var body = await context.Request.ReadFromJsonAsync<Dictionary<string, string>>();

    if (body == null || 
        !body.TryGetValue("token", out string token) || 
        !body.TryGetValue("email", out string email) || 
        !body.TryGetValue("userId", out string userId))
    {
        return Results.BadRequest("Invalid data.");
    }

    bool result = await new Database().CheckTokenAsync(token, email, userId);

    return Results.Ok(new { isTokenValid = result });
});

app.MapPost("/api/user/upload_profile_picture", async (HttpRequest request) =>
{
    var form = await request.ReadFormAsync();

    if (!form.TryGetValue("userId", out var userIdString) || !int.TryParse(userIdString, out int userId))
    {
        return Results.BadRequest("Invalid or missing userId.");
    }

    var file = form.Files["profilePicture"];
    if (file == null || file.Length == 0)
    {
        return Results.BadRequest("No file uploaded.");
    }

    try
    {
        string fileName = $"profile_picture_{DateTime.UtcNow.Ticks}.png";
        string directory = $"/var/data/users/{userId}/media";
        string filePath = Path.Combine(directory, fileName);
        string relativePath = $"/var/data/users/{userId}/media/{fileName}";

        // Създай папката, ако не съществува
        if (!Directory.Exists(directory))
            Directory.CreateDirectory(directory);

        // Запиши файла
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Обнови JSON файла
        SaveDataToJSON.AddOrUpdateProfilePicturePath(userId, relativePath);

        return Results.Ok(new { message = "Profile picture uploaded.", path = relativePath });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error saving file: {ex.Message}");
    }
});


app.Run();
