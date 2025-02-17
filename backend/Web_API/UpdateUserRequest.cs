using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using MySql.Data.MySqlClient;
using Newtonsoft.Json.Linq;

[ApiController]
[Route("api")]
public class UserController : ControllerBase
{
    private string Id { get; set; }
    private string FilePath { get; set; }
    private Message Message { get; set; }

    public UserController(string id)
    {
        Message = new Message();
        FilePath = $"../users/{id}/profile_info.json"; // Path to the JSON file
        Id = id;
    }

    private bool CheckData(string firstName, string lastName, string email, string oldPass, string newPass, string repeatedPass)
    {
        CheckRegisterData checkData = new CheckRegisterData();

        if (!string.IsNullOrEmpty(firstName) && checkData.IsNameValid(firstName))
        {
            Message.firstName = true;
        }

        if (!string.IsNullOrEmpty(lastName) && checkData.IsNameValid(lastName))
        {
            Message.lastName = true;
        }

        if(!string.IsNullOrEmpty(newPass) && checkData.ArePasswordsMatch(newPass, repeatedPass))
        {
            Message.ArePasswordsMatch = true;
        }

        if (!string.IsNullOrEmpty(newPass) && new CheckLoginData().IsValidData(newPass, @"^(?=.*\d)(?=.*[a-z]).{8,}$") && !string.IsNullOrEmpty(oldPass) && new Database().IsUserSelected("SELECT * FROM Users WHERE Id = @Id AND Password = @PasswordHash;", int.Parse(Id),  email, oldPass)[0])
        {
            Message.isPasswordValid = true;
        }

        System.Console.WriteLine(email);

        if (!string.IsNullOrEmpty(email) && new CheckLoginData().IsValidData(email, @"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$"))
        {
            Message.email = true;
        }

        return true;
    }

    public IActionResult UpdateUser([FromBody] UpdateUserRequest request)
    {
        if (request == null)
        {
            return BadRequest(new { message = false });
        }

        // Проверяваме дали параметрите са null, ако да, подаваме празен стринг ""
        string firstName = request.FirstName ?? "";
        string lastName = request.LastName ?? "";
        string email = request.Email ?? "";
        string oldPass = request.OldPass ?? "";
        string newPass = request.Password ?? "";
        string repeatedPass = request.RepeatedPassword ?? "";

        CheckData(firstName, lastName, email, oldPass, newPass, repeatedPass);

        // Зареждане на съществуващите данни
        var existingData = LoadUserData();

        System.Console.WriteLine(firstName);
        System.Console.WriteLine(lastName);
        System.Console.WriteLine(existingData.ContainsKey("personalInfo"));

        // Уверяваме се, че 'personalInfo' е речник
        if (existingData.ContainsKey("personalInfo") && existingData["personalInfo"] is JObject personalInfo)
        {
            if (!string.IsNullOrEmpty(firstName) && Message.firstName) personalInfo["FirstName"] = firstName;
            if (!string.IsNullOrEmpty(lastName) && Message.lastName) personalInfo["LastName"] = lastName;
            if (!string.IsNullOrEmpty(request.Grade)) personalInfo["Grade"] = request.Grade;
        }

        // Добавяме или обновяваме "Description" полето
        if (!string.IsNullOrEmpty(request.Description))
        {
            existingData["description"] = request.Description;
        }

        if(Message.isPasswordValid && Message.ArePasswordsMatch){
            new Database().IsUserSelected("UPDATE Users SET Password = @PasswordHash WHERE Id = @Id;", int.Parse(Id),  email, newPass);
        }

        if(Message.email){
            new Database().IsUserSelected("UPDATE Users SET Email = @Email WHERE Id = @Id;", int.Parse(Id),  email, "");
        }

        SaveUserData(existingData);

        return Ok(Message);
    }


    // Load existing user data from JSON file using Dictionary
    private Dictionary<string, object> LoadUserData()
    {
        if (!System.IO.File.Exists(FilePath))
        {
            // If the file doesn't exist, return an empty dictionary
            return new Dictionary<string, object>();
        }

        string json = System.IO.File.ReadAllText(FilePath);
        return JsonConvert.DeserializeObject<Dictionary<string, object>>(json);
    }

    // Save the updated data back to the JSON file
    private void SaveUserData(Dictionary<string, object> data)
    {
        string json = JsonConvert.SerializeObject(data, Formatting.Indented);
        System.IO.File.WriteAllText(FilePath, json);
    }
}


public class UpdateUserRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Description { get; set; }
    public string? Grade { get; set; }
    public string? Email {get; set;}
    public string? OldPass {get; set;}
    public string? Password {get; set;}
    public string? RepeatedPassword {get; set;}
}

public class Message
{
    public bool firstName { get; set; }
    public bool lastName { get; set; }
    public bool email { get; set; }
    public bool ArePasswordsMatch { get; set; }
    public bool isPasswordValid { get; set; }
}