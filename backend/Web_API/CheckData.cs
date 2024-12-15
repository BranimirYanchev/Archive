using System.Text.RegularExpressions;
using System;

class CheckData
{
    public string Email
    {
        get; set;
    }

    public string Password
    {
        get; set;
    }

    public CheckData(string email, string password)
    {
        Email = email;
        Password = password;
    }

    private bool IsValidData(string data, string regex)
    {
        if (!new Regex(regex).IsMatch(data))
        {
            return false;
        }

        return true;
    }

    public ResponseMessage Message()
    {
        
        // Example logic for creating a response
        bool isEmailValid = IsValidData(Email, @"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$");
        bool isPasswordValid = IsValidData(Password, @"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$");

        return new ResponseMessage
        {
            Email = isEmailValid,
            Password = isPasswordValid,
            Url = isEmailValid && isPasswordValid ? "profile.html" : ""
        };
    }

}

public class ResponseMessage
{
    public bool Email { get; set; }
    public bool Password { get; set; }
    public string Url { get; set; }
}
