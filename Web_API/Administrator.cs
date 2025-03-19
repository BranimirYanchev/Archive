public static class Administrator
{
    public static IResult GetUsersData()
    {
        List<User> users = new List<User>();
        Database database = new Database();
        using (MySqlConnection connection = database.Connect())
        {
            connection.Open();
            using (var command = new MySqlCommand("SELECT id, email, role FROM users", connection))
            {
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        users.Add(new User
                        {
                            Id = reader.GetInt32(0),
                            Email = reader.GetString(1),
                            Role = reader.GetString(2)
                        });
                    }
                }
            }
        }
        return Results.Ok(users);
    }
}

public class User
{
    public int Id { get; set; }
    public string Email { get; set; }
    public string Role { get; set; }
}