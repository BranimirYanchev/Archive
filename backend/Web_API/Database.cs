using MySql.Data.MySqlClient;
using System;

class Database
{
    MySqlConnection myConnection;
    public MySqlConnection Connect()
    {
        string myConnectionString = "server=127.0.0.1;port=8889;user=admin;password=admin1234;database=archive-db;";

        myConnection = new MySqlConnection(myConnectionString);

        return myConnection;
    }

    // Checks if user exists!
    public List<bool> IsUserSelected(string query, int id, string email, string password, string role = "")
    {
        password = new DataOperations().HashPassword(password);
        List<bool> message = new List<bool>();

        MySqlConnection conn = Connect();
        conn.Open();

        using (MySqlCommand command = new MySqlCommand(query, myConnection))
        {
            if (id != 0)
            {
                command.Parameters.AddWithValue("@Id", id);
            }

            System.Console.WriteLine(password);

            if(!string.IsNullOrEmpty(email)){
                command.Parameters.AddWithValue("@Email", email);
            }

            if(!string.IsNullOrEmpty(password)){
                command.Parameters.AddWithValue("@PasswordHash", password);
            }

            if (role != "role" && role != "")
            {
                command.Parameters.AddWithValue("@Role", role);
            }

            using (var reader = command.ExecuteReader())  // Opening DataReader
            {
                message.Add(reader.HasRows);
                reader.Close();  // Explicitly close the reader
            }

            conn.Close();
        }

        return message;
    }

    public int GetLastUserID()
    {
        int id = 0;
        Database database = new Database();
        using (MySqlConnection connection = database.Connect())
        {
            connection.Open();
            using (var command = new MySqlCommand("SELECT IFNULL(MAX(Id), 0) + 1 FROM Users", connection))
            {
                var result = command.ExecuteScalar();
                if (result != null && result != DBNull.Value)
                {
                    id = Convert.ToInt32(result);
                }
            }
        }

        return id;
    }

    public int GetCurrentUserID(string email)
    {
        int id = 0; // Default value if no ID is found

        Database database = new Database();
        using (MySqlConnection connection = database.Connect())
        {
            connection.Open();
            using (var command = new MySqlCommand("SELECT Id FROM Users WHERE Email = @Email LIMIT 1", connection))
            {
                command.Parameters.AddWithValue("@Email", email);

                var result = command.ExecuteScalar();
                if (result != null && result != DBNull.Value)
                {
                    id = Convert.ToInt32(result);
                }
            }
        }

        return id;
    }

    public bool InsertProfileImagePath(string id, string imgUrl="")
    {
        Database database = new Database();
        using (MySqlConnection connection = database.Connect())
        {
            connection.Open();
            using (var command = new MySqlCommand("UPDATE users SET `img-url` = @ImgUrl WHERE `Id` = @Id;", connection))
            {
                if(imgUrl == ""){
                    command.Parameters.AddWithValue("@ImgUrl", null);
                }else{
                    command.Parameters.AddWithValue("@ImgUrl", imgUrl);
                }

                command.Parameters.AddWithValue("@Id", id);

                var result = command.ExecuteScalar();
                if (result != null && result != DBNull.Value)
                {
                    return true;
                }

                return false;
            }
        }
    }

    public string GetProfileImgUrl(string id)
    {
        string url = "";
        Database database = new Database();
        using (MySqlConnection connection = database.Connect())
        {
            connection.Open();
            using (var command = new MySqlCommand("SELECT `img-url` FROM users WHERE Id = @Id;", connection))
            {
                command.Parameters.AddWithValue("@Id", id);

                var result = command.ExecuteScalar();
                if (result != null && result != DBNull.Value)
                {
                    url = result.ToString();
                }
            }
        }
        return url;
    }
}