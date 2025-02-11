using System;
using System.IO;
using System.Text.Json;
using System.Data.SqlClient;
using MySql.Data.MySqlClient;
using Microsoft.AspNetCore.Identity;
using Microsoft.VisualBasic;
using System.Security.Cryptography.X509Certificates;
using System.Reflection.Metadata.Ecma335;

static class SaveDataToJSON
{
    private static string folderPath = ""; // Папката, в която ще се записват файловете

    public static void SaveUserInfo(int id, string firstName, string lastName, string role)
    {
        ResponseMessage responseMessage = new ResponseMessage();
        if (id == 0)
        {
            return;
        }

        Database database = new Database();

        folderPath = $"../users/{id}";

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
                    Timestamp = DateTime.Now
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

            Console.WriteLine($"Файлът {fileName} беше успешно записан.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Грешка при запис в JSON: {ex.Message}");
        }
    }

}

class SaveImage
{
    private IFormFile File { get; set; }
    public ResponseMessage Message { get; set; }
    public string Id { get; set; }
    public SaveImage(IFormFile file, string userId)
    {
        File = file;
        Message = new ResponseMessage()
        {
            IsFileSaved = false,
            IsFileTypeCorrect = false,
            IsFileSelected = false,
            IsFileInCorrectSize = false
        };

        Id = userId;

        SaveImageToJSON();
    }
    private bool CheckImage()
    {
        if (File == null || File.Length == 0)
        {
            return false;
        }

        Message.IsFileSelected = true;
        // Allowed image MIME types
        var allowedMimeTypes = new HashSet<string>
        {
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
        };

        // Allowed image extensions
        var allowedExtensions = new HashSet<string>
        {
        ".jpg", ".jpeg", ".png", ".gif", ".webp"
        };

        var fileExtension = Path.GetExtension(File.FileName).ToLower();
        if (!allowedExtensions.Contains(fileExtension.ToLower()) || !allowedMimeTypes.Contains(File.ContentType.ToLower()))
        {
            return false;
        }

        Message.IsFileTypeCorrect = true;

        return true;
    }
    public async void SaveImageToJSON()
    {
        CheckFileSize(File);

        if (!CheckImage() || !Message.IsFileInCorrectSize)
        {
            System.Console.WriteLine(1);
            return;
        }

        try
        {
            string uploadPath = $"../users/{Id}";

            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            string uniqueFileName = "profile_img" + Path.GetExtension(File.FileName);
            string filePath = Path.Combine(uploadPath, uniqueFileName);

            string previousPath = Path.Combine(uploadPath, new Database().GetProfileImgUrl(Id));
            if (previousPath != "" && System.IO.File.Exists(previousPath))
            {
                System.IO.File.Delete(previousPath);
            }

            using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write))
            {
                await File.CopyToAsync(stream);
            }

            new Database().InsertProfileImagePath(Id, $"{uniqueFileName}");
            
            Message.IsFileSaved = true;
        }
        catch (Exception ex)
        {
            System.Console.WriteLine(ex);
        }
    }

   
    public void CheckFileSize(IFormFile file)
    {
        try
        {
            // Get the file size in bytes
            long fileSizeInBytes = file.Length;

            // Print out the file size in bytes
            Console.WriteLine($"File size: {fileSizeInBytes} bytes");

            // Example: Check if file size is larger than a specific limit (e.g., 10MB)
            long maxFileSize = 3 * 1024 * 1024; // 10MB in bytes
            if (fileSizeInBytes <= maxFileSize)
            {
                Message.IsFileInCorrectSize = true;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}

class ResponseMessage
{
    public bool IsFileSelected { get; set; }
    public bool IsFileTypeCorrect { get; set; }
    public bool IsFileSaved { get; set; }
    public bool IsFileInCorrectSize {get; set;}
}
