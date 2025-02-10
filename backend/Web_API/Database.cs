using MySql.Data.MySqlClient;
using System;

class Database
{
    MySqlConnection myConnection;
    public MySqlConnection Connect()
    {
        string myConnectionString  = "server=127.0.0.1;port=8889;user=admin;password=admin1234;database=archive-db;";

        myConnection = new MySqlConnection(myConnectionString);

        return myConnection;
    }

    // Checks if user exists!
    public List<bool> IsUserSelected(string query, int id, string email, string password, string role = "")
    {
        List<bool> message = new List<bool>();
        using (MySqlCommand command = new MySqlCommand(query, myConnection))
        {
            if(id != 0){
                command.Parameters.AddWithValue("@Id", id);
            }
            command.Parameters.AddWithValue("@Email", email);
            command.Parameters.AddWithValue("@PasswordHash", password);

            if(role != "role"){
                command.Parameters.AddWithValue("@Role", role);
            }

            using (var reader = command.ExecuteReader())  // Opening DataReader
            {
                message.Add(reader.HasRows);
                reader.Close();  // Explicitly close the reader
            }
        }

        return message;
    }

    public int GetLastUserID(){
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
}