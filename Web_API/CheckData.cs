using System.Text.RegularExpressions;
using System;
using MySql.Data.MySqlClient;
using Microsoft.AspNetCore.SignalR;
using Org.BouncyCastle.Bcpg.Sig;
using MailKit.Net.Smtp;
using MimeKit;
using System.Runtime.InteropServices;

// Login

class CheckLoginData
{
    public string Email
    {
        get; set;
    }

    public string Password
    {
        get; set;
    }

    public CheckLoginData(string email = "", string password = "")
    {
        Email = email;
        Password = password;
    }

    public bool IsValidData(string data, string regex)
    {
        if (!new Regex(regex).IsMatch(data))
        {
            return false;
        }

        return true;
    }

    public LoginResponseMessage Message()
    {
        // Example logic for creating a response
        bool isEmailValid = IsValidData(Email, @"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$");
        bool isPasswordValid = IsValidData(Password, @"^(?=.*\d)(?=.*[a-z]).{8,}$");
        int id = 0;
        bool isUserExists = false;

        if (isPasswordValid)
        {
            isUserExists = new CheckUserInDatabase().IsUserExists(Email, Password);
            id = new Database().GetCurrentUserID(Email);
        }

        return new LoginResponseMessage
        {
            Email = isEmailValid,
            Password = isPasswordValid,
            IsUserExists = isUserExists,
            Id = id,
            Url = isEmailValid && isPasswordValid && isUserExists ? "profile.html" : ""
        };
    }
}

class LoginResponseMessage
{
    public bool Email { get; set; }
    public bool Password { get; set; }
    public bool IsUserExists { get; set; }
    public int Id { get; set; }
    public string Url { get; set; }
}

// Register

class CheckRegisterData
{
    public string Email
    {
        get; set;
    }

    public string FirstName
    {
        get; set;
    }

    public string LastName
    {
        get; set;
    }

    public string Password
    {
        get; set;
    }

    public string RepeatedPassword
    {
        get; set;
    }

    public string Role
    {
        get; set;
    }

    public string Code
    {
        get; set;
    }

    public CheckRegisterData(string role, string email, string firstName, string lastName, string password, string repeatedPassword, string code)
    {
        Role = role;
        Email = email;
        FirstName = firstName;
        LastName = lastName;
        Password = password;
        RepeatedPassword = repeatedPassword;
        Code = code;
    }

    public CheckRegisterData(){}

    public bool IsCodeValid()
    {
        if (Role != "teacher")
        {
            return true;
        }
        else if (Code != "123456")
        {
            return false;
        }
        return true;
    }

    public bool ArePasswordsMatch(string pass, string pass1)
    {
        if (!(pass == pass1))
        {
            return false;
        }
        return true;
    }

    public bool IsNameValid(string field)
    {
        if (!new Regex(@"^[А-Я][а-я]+$").IsMatch(field))
        {
            return false;
        }
        return true;
    }

    public async Task<RegisterResponseMessage> Message(HttpContext context, bool isUserExists = false)
    {
        Database database = new Database();
        // Example logic for creating a response
        bool isEmailValid = new CheckLoginData().IsValidData(Email, @"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$");
        bool isPasswordValid = new CheckLoginData().IsValidData(Password, @"^(?=.*\d)(?=.*[a-z]).{8,}$");
        bool isFirstNameValid = IsNameValid(FirstName);
        bool isLastNameValid = IsNameValid(LastName);
        bool arePasswordsMatch = ArePasswordsMatch(Password, RepeatedPassword);
        bool IsRoleSelected = true;
        bool isCodeValid = IsCodeValid();
        int id = database.GetLastUserID();
        string url = "";

        if (Role == "role")
        {
            IsRoleSelected = false;
        }

        if (isEmailValid && isPasswordValid && isFirstNameValid && isLastNameValid && arePasswordsMatch && !isUserExists && isCodeValid && IsRoleSelected)
        {
            isUserExists = new CheckUserInDatabase().IsUserExists(Email, Password);

            if (!isUserExists)
            {
                new DataOperations().InsertUser(id, Email, Password, Role);
                SaveDataToJSON.SaveUserInfo(id, FirstName, LastName, Role);
                url = "profile.html";

                string token = Guid.NewGuid().ToString();

                var emailService = context.RequestServices.GetRequiredService<EmailService>();
                await emailService.SendConfirmationEmailAsync(Email, token);

                database.SaveToken(id, token);
            }
        }

        return new RegisterResponseMessage
        {
            Role = IsRoleSelected,
            Code = isCodeValid,
            Email = isEmailValid,
            FirstName = isFirstNameValid,
            LastName = isLastNameValid,
            Password = isPasswordValid,
            PasswordsMatch = arePasswordsMatch,
            IsUserExists = isUserExists,
            Id = id.ToString(),
            Url = url
        };
    }
}

class RegisterResponseMessage
{
    public bool Role { get; set; }
    public bool Email { get; set; }
    public bool FirstName { get; set; }
    public bool LastName { get; set; }
    public bool Password { get; set; }
    public bool PasswordsMatch { get; set; }
    public bool IsUserExists { get; set; }
    public bool Code { get; set; }
    public string Id { get; set; }
    public string Url { get; set; }
}

class CheckUserInDatabase
{
    public bool IsUserExists(string email, string password)
    {
        Database database = new Database();
        MySqlConnection conn = database.Connect();

        // Prepare the SQL statement to select user data
        string query = "SELECT email, password FROM users WHERE email = @Email AND password = @PasswordHash;";
        if (database.IsUserSelected(query, 0, email, password)[0])
        {
            conn.Close();
            return true;
        }

        conn.Close();
        return false;
    }
}
