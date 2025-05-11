using System;
using System.IO;
using System.Text.Json;
using System.Data.SqlClient;
using MySql.Data.MySqlClient;
using Microsoft.AspNetCore.Identity;
using Microsoft.VisualBasic;
using System.Security.Cryptography.X509Certificates;
using System.Reflection.Metadata.Ecma335;
using System.Threading.Tasks;
using System.Drawing;
using System.Drawing.Imaging;
using Microsoft.AspNetCore.Http;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Png;

static class SaveDataToJSON
{
    private static string folderPath = ""; // Папката, в която ще се записват файловете

    public static void SaveUserInfo(int id, string firstName, string lastName, string role)
    {
        // ResponseMessage responseMessage = new ResponseMessage();
        if (id == 0)
        {
            return;
        }

        Database database = new Database();

        folderPath = $"/var/data/users/{id}";

        try
        {
            // Създаване на папката, ако не съществува
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            // Създаване на обект с потребителската информация
            var userInfo = new
            {
                personalInfo = new
                {
                    FirstName = firstName,
                    LastName = lastName,
                    Role = role,
                    Grade = "",
                    Timestamp = DateTime.Now.ToString("dd/mm/yyyy")
                }
            };
            // Име на файла (на база на името на потребителя)
            string fileName = Path.Combine(folderPath, $"profile_info.json");

            // Преобразуване в JSON формат с UTF-8
            var options = new JsonSerializerOptions
            {
                WriteIndented = true,
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };

            string json = JsonSerializer.Serialize(userInfo, options);

            // Записване с правилна кодировка (UTF-8 без BOM)
            File.WriteAllText(fileName, json, new System.Text.UTF8Encoding(false));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Грешка при запис в JSON: {ex.Message}");
        }
    }
    
    public static void AddOrUpdateProfilePicturePath(int id, string imagePath)
    {
        string jsonFilePath = $"/var/data/users/{id}/profile_info.json";

        try
        {
            // Ако няма JSON файл, създай нов
            if (!File.Exists(jsonFilePath))
            {
                SaveUserInfo(id, "", "", "");
            }

            // Прочети текущия JSON
            string json = File.ReadAllText(jsonFilePath);
            var jsonDoc = JsonDocument.Parse(json);
            var personalInfo = jsonDoc.RootElement.GetProperty("personalInfo");

            // Нов обект с добавено поле
            var updatedInfo = new
            {
                personalInfo = new
                {
                    FirstName = personalInfo.GetProperty("FirstName").GetString(),
                    LastName = personalInfo.GetProperty("LastName").GetString(),
                    Role = personalInfo.GetProperty("Role").GetString(),
                    Grade = personalInfo.TryGetProperty("Grade", out var grade) ? grade.GetString() : "",
                    Timestamp = personalInfo.GetProperty("Timestamp").GetString(),
                    ProfilePictureUrl = imagePath
                }
            };

            var options = new JsonSerializerOptions
            {
                WriteIndented = true,
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };

            string updatedJson = JsonSerializer.Serialize(updatedInfo, options);
            File.WriteAllText(jsonFilePath, updatedJson, new System.Text.UTF8Encoding(false));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating profile_info.json: {ex.Message}");
        }
    }


}
