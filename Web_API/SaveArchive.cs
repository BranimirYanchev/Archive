using Microsoft.AspNetCore.Components.Web;
using System;
using System.IO;
using Newtonsoft.Json;
using System.Collections.Generic;
using Microsoft.Extensions.ObjectPool;
using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Newtonsoft.Json.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;

public class ArchiveController : ControllerBase
{
    public string UploadImage(IFormFile file, string imgUrl)
    {
        if (file == null || file.Length == 0)
        {
            return "No file!";
        }

        // Проверка за позволени разширения
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLower();
        if (!allowedExtensions.Contains(extension))
        {
            return "Wrong extensions!";
        }

        try
        {
            // Генерираме път за запис
            string uploadsFolder = Path.Combine("/var/data", imgUrl);
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            string uniqueFileName = $"archive-img{Guid.NewGuid()}{extension}";
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Записваме файла
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                file.CopyTo(fileStream);
            }

            // Даваме правилни права
            var fileInfo = new FileInfo(filePath);
            fileInfo.Attributes = FileAttributes.Normal;

            // Връщаме URL за публичен достъп
            return $"/{imgUrl.TrimStart('/')}/{uniqueFileName}";
        }
        catch (Exception ex)
        {
            return "Internal Server Error";
        }
    }
}


class SaveArchive
{
    public string Title { get; set; }
    public string Description { get; set; }
    public string Category { get; set; }
    public string[] Keywords { get; set; }
    public string Email { get; set; }
    public string Id { get; set; }
    public string AuthorId { get; set; }
    public string Author { get; set; }
    public IFormFile Image { get; set; } 
    public SaveArchive(string title, string description, string category, string[] keywords, string email, string author, IFormFile file)
    {
        Title = title;
        Description = description;
        Category = category;
        Keywords = keywords;
        Email = email;
        Author = author;
        AuthorId = new Database().GetCurrentUserID(Email).ToString();
        Id = new Database().GetLastArchiveId().ToString();
        Image = file;
    }

    public SaveArchive() { }

    public bool CheckData(List<string> keywrds)
    {
        if (string.IsNullOrEmpty(Title) || string.IsNullOrEmpty(Description) || Description.Trim() == "<p><br></p>" || string.IsNullOrEmpty(Category) || keywrds.Count <= 0)
        {
            return false;
        }
        return true;
    }

    public Object SaveArchiveToJSON()
    {
        string imgUrl = $"users/{AuthorId}/media";
        imgUrl = new ArchiveController().UploadImage(Image, imgUrl);

        List<string> keywrds = Keywords[0].Split(',').Select(k => k.Trim()).ToList();

        if (!CheckData(keywrds))
        {
            return new { isSavedData = false, isDataCorrect = false };
        }

        string directory = $"/var/data/users/{AuthorId}";
        if (!Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }

        string fileName = Path.Combine(directory, "archives.json");
        List<object> archiveList = new List<object>();

        if (File.Exists(fileName))
        {
            string existingJson = File.ReadAllText(fileName);
            archiveList = JsonConvert.DeserializeObject<List<object>>(existingJson) ?? new List<object>();
        }

        var data = new
        {
            id = Id,
            title = Title,
            author = Author,
            description = Description,
            category = Category,
            keywords = keywrds,
            imageUrl = imgUrl,
            timestamp = DateTime.Now.ToString("dd/MM/yyyy")
        };

        archiveList.Add(data);
        string json = JsonConvert.SerializeObject(archiveList, Formatting.Indented);
        File.WriteAllText(fileName, json);

        new Database().InsertArchiveData(Id, AuthorId);

        return new { isSavedData = true };
    }
}

class UpdateArchive
{
    public string Title { get; set; }
    public string Description { get; set; }
    public string Category { get; set; }
    public List<string> Keywords { get; set; }
    public string Email { get; set; }
    public string Id { get; set; }
    public string AuthorId { get; set; }

    public UpdateArchive(string title, string description, string category, string[] keywords, string email, string id)
    {
        Title = title;
        Description = description;
        Category = category;
        Keywords = keywords[0].Split(',').Select(k => k.Trim()).ToList();
        Email = email;
        AuthorId = new Database().GetCurrentUserID(Email).ToString();
        Id = id;
    }

    public bool CheckData()
    {
        if (string.IsNullOrEmpty(Title) || string.IsNullOrEmpty(Description) || Description.Trim() == "<p><br></p>" || string.IsNullOrEmpty(Category) || Keywords.Count <= 0)
        {
            System.Console.WriteLine(Keywords.Count <= 0);
            return false;
        }
        return true;
    }

    public Object UpdateArchiveInJSON()
    {
        string filePath = $"/var/data/users/{AuthorId}/archives.json"; // Пътят към JSON файла

        if (!CheckData())
        {
            return new { isFileUpdated = false, isDataCorrect = false };
        }

        if (!File.Exists(filePath))
        {
            Console.WriteLine("Файлът не съществува.");
            return new { isFileUpdated = false };
        }

        // Четене на текущото съдържание на JSON файла
        string json = File.ReadAllText(filePath);
        dynamic data = JsonConvert.DeserializeObject(json);

        // Нови данни
        var form = new
        {
            title = Title,
            description = Description,
            category = Category,
            keywords = Keywords
        };

        // Обновяване на стойностите
        for (int i = 0; i < data.Count; i++)
        {
            JObject item = (JObject)data[i]; // Преобразуваме към JObject

            if (item.Value<int>("id") == int.Parse(Id)) // Проверяваме ID
            {
                item["title"] = form.title;
                item["description"] = form.description;
                item["category"] = form.category;
                item["keywords"] = JArray.FromObject(form.keywords);
            }
        }

        // Запис на обновеното съдържание в JSON файла
        string updatedJson = JsonConvert.SerializeObject(data, Formatting.Indented);
        File.WriteAllText(filePath, updatedJson);

        return new { isFileUpdated = true };
    }
}

class DeleteArchive
{
    public DeleteArchive(){}

    public Object DeleteArchiveFromJSON(string id, string email)
    {
        string filePath = $"/var/data/users/{new Database().GetCurrentUserID(email)}/archives.json"; // Пътят към JSON файла

        // Четене на текущото съдържание на JSON файла
        string json = File.ReadAllText(filePath);
        dynamic data = JsonConvert.DeserializeObject(json);

        // Обновяване на стойностите
        for (int i = 0; i < data.Count; i++)
        {
            JObject item = (JObject)data[i];

            if (item.Value<int>("id") == int.Parse(id)) // Ако намерим елемента по ID
            {
                data.RemoveAt(i); // Изтриваме елемента от JArray
                break; // Прекратяваме цикъла, след като намерим и изтрием елемента
            }
        }

        // Запис на обновеното съдържание в JSON файла
        string updatedJson = JsonConvert.SerializeObject(data, Formatting.Indented);
        File.WriteAllText(filePath, updatedJson);

        if(new Database().DeleteArchiveFromDatabase(id)){
            return new { isArchiveDeleted = true };
        }

        return new { isArchiveDeleted = false };
    }
}

