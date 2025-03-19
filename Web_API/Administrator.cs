using System.Text.RegularExpressions;
using System;
using System.Text.Json;
using MySql.Data.MySqlClient;
using Microsoft.AspNetCore.SignalR;
using Org.BouncyCastle.Bcpg.Sig;
using MailKit.Net.Smtp;
using MimeKit;
using System.Runtime.InteropServices;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json.Linq;

public class Administrator : ControllerBase
{
    public Administrator() { }

    public async Task<IResult> GetUsersData()
    {
        List<User> users = new List<User>();
        Database database = new Database();
        using (MySqlConnection connection = database.Connect())
        {
            await connection.OpenAsync(); // Използвай async версията

            using (var command = new MySqlCommand("SELECT id, email, role FROM users", connection))
            {
                using (var reader = await command.ExecuteReaderAsync()) // async четене
                {
                    while (await reader.ReadAsync()) // async обхождане на резултатите
                    {
                        users.Add(new User
                        {
                            Id = reader.GetInt32(0),
                            Email = reader.GetString(1),
                            Role = reader.GetString(2)
                        });
                    }
                }
            }
        }
        return Results.Ok(users);
    }

    [HttpPost]
    public async Task<IResult> HideArchive([FromBody] HideArchiveRequest request)
    {
        if (request == null)
        {
            return Results.BadRequest(new { message = "Invalid request" });
        }

        int userId = request.UserId;
        int archiveId = request.ArchiveId;

        var filePath = $"/var/data/users/{userId}/archives.json";

        if (!System.IO.File.Exists(filePath))
        {
            return Results.NotFound(new { message = "User archives not found" });
        }

        string json = await System.IO.File.ReadAllTextAsync(filePath);
        var archives = JsonConvert.DeserializeObject<List<Archive>>(json) ?? new List<Archive>();

        var archive = archives.FirstOrDefault(a => a.Id == archiveId.ToString());
        if (archive == null)
        {
            return Results.NotFound(new { message = "Archive not found" });
        }

        archive.Status = "hidden";

        string updatedJson = JsonConvert.SerializeObject(archives, Formatting.Indented);
        await System.IO.File.WriteAllTextAsync(filePath, updatedJson);

        return Results.Ok(new { message = "Archive hidden successfully" });
    }


}

// Клас за десериализация на архиви
public class Archive
{
    public string id { get; set; }
    public string title { get; set; }
    public string author { get; set; }
    public string description { get; set; }
    public string category { get; set; }
    public List<string> keywords { get; set; }
    public string imageUrl { get; set; }
    public string timestamp { get; set; }
    public string? status { get; set; } // Новото поле
}

public class User
{
    public int Id { get; set; }
    public string Email { get; set; }
    public string Role { get; set; }
}

public class HideArchiveRequest
{
    public int UserId { get; set; }
    public int ArchiveId { get; set; }
}
