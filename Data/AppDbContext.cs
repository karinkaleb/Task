using Microsoft.EntityFrameworkCore;
using Report.Models;

namespace Report.Data;

// Контекст базы данных приложения
public class AppDbContext : DbContext
{
    // Таблица данных скорость, температура, давление
    public DbSet<Telemetry> Telemetries { get; set; }

    // Таблица комментариев к показателям
    public DbSet<Comment> Comments { get; set; }

    // Новый экземпляр 
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
}