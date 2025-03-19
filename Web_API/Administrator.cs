using System.Text.RegularExpressions;
using System;
using System.Text.Json;
using MySql.Data.MySqlClient;
using Microsoft.AspNetCore.SignalR;
using Org.BouncyCastle.Bcpg.Sig;
using MailKit.Net.Smtp;
using MimeKit;
using System.Runtime.InteropServices;

public static class Administrator
{
    public static IResult GetUsersData()
    {
        List<User> users = new List<User>();
        Database database = new Database();
        using (MySqlConnection connection = database.Connect())
        {
            connection.Open();
            using (var command = new MySqlCommand("SELECT id, email, role FROM users", connection))
            {
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
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

    public static IResult HideArchive(int userId, int archiveId)
    {
        string filePath = $"/var/data/users/{userId}/archives.json";

        if (!File.Exists(filePath))
        {
            return Results.NotFound("Файлът с архиви не съществува.");
        }

        try
        {
            string json = File.ReadAllText(filePath);
            var archives = JsonSerializer.Deserialize<List<Archive>>(json);

            if (archives == null)
            {
                return Results.Problem("Грешка при зареждане на архивите.");
            }

            var archive = archives.FirstOrDefault(a => a.Id == archiveId.ToString());
            
            if (archive == null)
            {
                return Results.NotFound("Архивът не е намерен.");
            }

            archive.Status = "hidden"; // Добавяме новото поле

            // Запазваме обновените данни обратно в JSON файла
            File.WriteAllText(filePath, JsonSerializer.Serialize(archives, new JsonSerializerOptions { WriteIndented = true }));

            return Results.Ok("Архивът е успешно скрит.");
        }
        catch (Exception ex)
        {
            return Results.Problem($"Грешка при обработката: {ex.Message}");
        }
    }

    // Клас за десериализация на архиви
    public class Archive
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public List<string> Keywords { get; set; }
        public string ImageUrl { get; set; }
        public string Timestamp { get; set; }
        public string? Status { get; set; } // Новото поле
    }

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
