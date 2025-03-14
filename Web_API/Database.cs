using MySql.Data.MySqlClient;
using System;

class Database
{
    MySqlConnection myConnection;
    public MySqlConnection Connect()
    {
        string myConnectionString = "server=brvftrf5xgl4awjmc3ih-mysql.services.clever-cloud.com;port=3306;user=ujgzqhu3rohbx1zm;password=ukppJ82P3387I6yjUysf;database=brvftrf5xgl4awjmc3ih;SslMode=Required;";

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
            using (var command = new MySqlCommand("SELECT IFNULL(MAX(Id), 0) + 1 FROM users", connection))
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
            using (var command = new MySqlCommand("SELECT Id FROM users WHERE Email = @Email LIMIT 1", connection))
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

    public int GetLastArchiveId()
    {
        int id = 0;
        Database database = new Database();
        using (MySqlConnection connection = database.Connect())
        {
            connection.Open();
            using (var command = new MySqlCommand("SELECT IFNULL(MAX(Id), 0) + 1 FROM archives", connection))
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

    public bool InsertArchiveData(string id, string authorId)
    {
        Database database = new Database();
        using (MySqlConnection connection = database.Connect())
        {
            connection.Open();
            using (var command = new MySqlCommand("INSERT INTO archives (id, author_id) VALUES (@Id, @AuthorId)", connection))
            {
                command.Parameters.AddWithValue("@Id", id);
                command.Parameters.AddWithValue("@AuthorId", authorId);

                var result = command.ExecuteScalar();
                return true;
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

    public bool DeleteArchiveFromDatabase(string archiveId)
    {
        Database database = new Database();
        using (MySqlConnection connection = database.Connect())
        {
            connection.Open();
            using (var command = new MySqlCommand("DELETE FROM archives WHERE Id = @Id;", connection))
            {
                command.Parameters.AddWithValue("@Id", archiveId);
    
                int rowsAffected = command.ExecuteNonQuery(); // Изпълняваме DELETE заявката
                return rowsAffected > 0; // Ако има изтрити редове, връщаме true
            }
        }
    }

    public bool SaveToken(int userId, string token)
    {
        Database database = new Database(); // Предполагам, че имаш клас Database за връзка с MySQL

        using (MySqlConnection connection = database.Connect())
        {
            connection.Open();
            using (var command = new MySqlCommand("UPDATE users SET token = @Token WHERE Id = @UserId;", connection))
            {
                command.Parameters.AddWithValue("@UserId", userId);
                command.Parameters.AddWithValue("@Token", token);

                int rowsAffected = command.ExecuteNonQuery(); // Изпълняваме INSERT заявката
                return rowsAffected > 0; // Ако е добавен ред, връщаме true
            }
        }
    }

    public bool CheckToken(string token)
    {
        Database database = new Database(); // Предполагам, че имаш клас Database за връзка с MySQL

        using (MySqlConnection connection = database.Connect())
        {
            connection.Open();
            using (var command = new MySqlCommand("SELECT COUNT(*) FROM users WHERE token = @Token;", connection))
            {
                command.Parameters.AddWithValue("@Token", token);

                int count = Convert.ToInt32(command.ExecuteScalar()); // Връща броя на намерените редове

                if (count > 0) // Ако намерим потребител с този token
                {
                    using (var updateCommand = new MySqlCommand("UPDATE users SET isEmailVerified = 1 WHERE token = @Token;", connection))
                    {
                        updateCommand.Parameters.AddWithValue("@Token", token);
                        int rowsUpdated = updateCommand.ExecuteNonQuery();
                        return rowsUpdated > 0;
                    }
                }
                return false;
            }
        }
    }

    public bool CheckIfEmailIsVerified(string email)
    {
        Database database = new Database(); // Предполагам, че имаш клас Database за връзка с MySQL

        using (MySqlConnection connection = database.Connect())
        {
            connection.Open();
            using (var command = new MySqlCommand("SELECT COUNT(*) FROM users WHERE email = @Email AND isEmailVerified = 1;", connection))
            {
                command.Parameters.AddWithValue("@Email", email);

                var result = command.ExecuteScalar();
                int count = Convert.ToInt32(result);

                return count > 0;
            }
        }
    }


}
