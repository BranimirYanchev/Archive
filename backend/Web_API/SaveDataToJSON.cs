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
                    Grade = "",
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
    public string UploadPath { get; set; }
    public SaveImage(IFormFile file, string userId)
    {
        File = file;
        Message = new ResponseMessage()
        {
            IsFileSaved = false,
            IsFileTypeCorrect = false,
            IsFileInCorrectSize = false,
            IsNotFileExists = false,
            IsFileSelected = false,
        };

        Id = userId;

        UploadPath = $"../users/{Id}";

        SaveImageToDirectory();
    }

    public SaveImage(string id)
    {
        Id = id;
        UploadPath = $"../users/{Id}";
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

    public async Task<bool> SaveImageToDirectory()
    {
        CheckFileSize(File);

        if (!CheckImage() || !Message.IsFileInCorrectSize)
        {
            System.Console.WriteLine(1);
            return false;
        }

        try
        {
            if (!Directory.Exists(UploadPath))
            {
                Directory.CreateDirectory(UploadPath);
            }

            Message.IsNotFileExists = true;

            string uniqueFileName = "profile_img" + Path.GetExtension(File.FileName);
            string filePath = Path.Combine(UploadPath, uniqueFileName);

            // Get previous image path from DB
            string previousPath = Path.Combine(UploadPath, new Database().GetProfileImgUrl(Id));

            await DeleteImg();

            using (var memoryStream = new MemoryStream())
            {
                await File.CopyToAsync(memoryStream);
                memoryStream.Position = 0; // Reset stream position

                // ✅ Use ImageSharp to process & save image
                using (var image = await Image.LoadAsync(memoryStream))
                {
                    image.Mutate(x => x.Resize(800, 800)); // Resize to 800x800
                    await image.SaveAsync(filePath, new PngEncoder());
                }
            }

            // ✅ Update image path in DB
            new Database().InsertProfileImagePath(Id, uniqueFileName);
            Message.IsFileSaved = true;

            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            return false;
        }
    }
    public async Task<bool> DeleteImg()
    {
        
        Database database = new Database();

        string previousPath = Path.Combine(UploadPath, database.GetProfileImgUrl(Id));

        System.Console.WriteLine(previousPath);
        if (previousPath != "" && System.IO.File.Exists(previousPath))
        {
            System.IO.File.Delete(previousPath);

            GC.Collect();
            GC.WaitForPendingFinalizers();
            await Task.Delay(100); // ⏳ Малко изчакване преди запис
        }

        database.InsertProfileImagePath(Id);

        if (!System.IO.File.Exists(previousPath) && database.GetProfileImgUrl(Id) == "")
        {
            return true;
        }

        return false;
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
            long maxFileSize = 1 * 1024 * 1024; // 1MB in bytes
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
    public bool IsFileInCorrectSize { get; set; }
    public bool IsNotFileExists { get; set; }
    public bool IsFileSaved { get; set; }
}
