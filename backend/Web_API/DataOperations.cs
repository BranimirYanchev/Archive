using MySql.Data.MySqlClient;
using Org.BouncyCastle.Asn1.Rosstandart;
using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;

class DataOperations
{
    Database database = new Database();
    // Method to hash a password using SHA256
    public string HashPassword(string password)
    {
        using (SHA256 sha256 = SHA256.Create())
        {
            byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            StringBuilder builder = new StringBuilder();
            foreach (byte b in bytes)
            {
                builder.Append(b.ToString("x2")); // Convert to hexadecimal
            }
            return builder.ToString();
        }
    }
    // Method to connect and insert data into the database
    public void InsertUser(string email, string password)
    {
        MySqlConnection myConnection = database.Connect();
        myConnection = database.Connect();
        myConnection.Open();

        // Prepare the SQL statement with parameters to prevent SQL injection
        string query = "INSERT INTO users (email, password) VALUES (@Email, @PasswordHash)";
        database.runQuery(query, email, password);

        myConnection.Close();
    }
}
