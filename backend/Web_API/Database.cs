using System.Security.AccessControl;
using Microsoft.EntityFrameworkCore;

public class YourDbContext : DbContext
{
    public YourDbContext(DbContextOptions<YourDbContext> options)
        : base(options)
    { }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseMySQL("server=localhost;port=8888;database=archive-db;user=admin;password=admin1234");
    }

    public DbSet<User> Customers { get; set; }
}
