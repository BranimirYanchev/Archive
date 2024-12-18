using System.Text.RegularExpressions;
using System;
using MySql.Data.MySqlClient;

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

    public CheckLoginData(string email, string password)
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

    public LoginResponseMessage Message()
    {
        // Example logic for creating a response
        bool isEmailValid = IsValidData(Email, @"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$");
        bool isPasswordValid = IsValidData(Password, @"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$");
        bool isUserExists = false;

        if(isPasswordValid)
        {
            string hashedPassword = new DataOperations().HashPassword(Password);
            isUserExists = new CheckUserInDatabase().IsUserExists(Email, hashedPassword);
        }

        return new LoginResponseMessage
        {
            Email = isEmailValid,
            Password = isPasswordValid,
            IsUserExists = isUserExists,
            Url = isEmailValid && isPasswordValid && isUserExists ? "profile.html" : ""
        };
    }
}

class LoginResponseMessage
{
    public bool Email { get; set; }
    public bool Password { get; set; }
    public bool IsUserExists { get; set; }
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

    public CheckRegisterData(string role, string email, string firstName, string lastName, string password, string repeatedPassword)
    {
        Email = email;
        FirstName = firstName;
        LastName = lastName;
        Password = password;
        RepeatedPassword = repeatedPassword;
    }

    public bool ArePasswordsMatch(string pass, string pass1)
    {
        if(!(pass == pass1))
        {
            return false;
        }
        return true;
    }

    public bool IsEmptyField(string field)
    {
        if (field == "" || field == null)
        {
            return false;
        }
        return true;
    }

    private bool IsValidData(string data, string regex)
    {
        if (!new Regex(regex).IsMatch(data))
        {
            return false;
        }

        return true;
    }

    public RegisterResponseMessage Message(bool isUserExists = false)
    {
        // Example logic for creating a response
        bool isEmailValid = IsValidData(Email, @"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$");
        bool isPasswordValid = IsValidData(Password, @"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$");
        bool isFirstNameValid = IsEmptyField(FirstName);
        bool isLastNameValid = IsEmptyField(LastName);
        bool arePasswordsMatch = ArePasswordsMatch(Password, RepeatedPassword);

        if(isPasswordValid && arePasswordsMatch)
        {
            string hashedPassword = new DataOperations().HashPassword(Password);
            isUserExists = new CheckUserInDatabase().IsUserExists(Email, hashedPassword);

            if(!isUserExists){
                new DataOperations().InsertUser(Email, hashedPassword);
            }
        }

        return new RegisterResponseMessage
        {
            Email = isEmailValid,
            FirstName = isFirstNameValid,
            LastName = isLastNameValid,
            Password = isPasswordValid,
            PasswordsMatch = arePasswordsMatch,
            IsUserExists = isUserExists,
            Url = isEmailValid && isPasswordValid && isFirstNameValid && isLastNameValid && arePasswordsMatch && !isUserExists ? "profile.html" : ""
        };
    }
}

class RegisterResponseMessage
{
    public bool Email { get; set; }
    public bool FirstName { get; set; }
    public bool LastName { get; set; }
    public bool Password { get; set; }
    public bool PasswordsMatch { get; set; }
    public bool IsUserExists { get; set; }
    public string Url { get; set; }
}

class CheckUserInDatabase
{
    public bool IsUserExists(string email, string password)
    {
        Database database = new Database();
        MySqlConnection conn = database.Connect();
        conn.Open();

        // Prepare the SQL statement to select user data
        string query = "SELECT email, password FROM users WHERE email = @Email AND password = @PasswordHash;";
        if (database.runQuery(query, email, password)[0])
        {
            Console.WriteLine("User with this data already exists!");
            conn.Close();
            return true;
        }

        conn.Close();
        return false;
    }
}