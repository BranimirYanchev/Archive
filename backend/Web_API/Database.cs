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

    public List<bool> runQuery(string query, string email, string password)
    {
        List<bool> message = new List<bool>();
        using (MySqlCommand command = new MySqlCommand(query, myConnection))
        {
            command.Parameters.AddWithValue("@Email", email);
            command.Parameters.AddWithValue("@PasswordHash", password);

            using (var reader = command.ExecuteReader())  // Opening DataReader
            {
                message.Add(reader.HasRows);
                reader.Close();  // Explicitly close the reader
            }
        }

        return message;
    }
}
