using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Report.Data;
using System.Reflection;
using System.IO;
using System;
using System.Linq;
using System.Collections.Generic;
using Report.Models;
using Microsoft.OpenApi.Models;
    
var builder = WebApplication.CreateBuilder(args);

// Добавляем контроллеры API
builder.Services.AddControllers();

// Entity Framework + SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=telemetry.db"));

// Кэширование
builder.Services.AddMemoryCache();

builder.Services.AddResponseCaching();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    c.IncludeXmlComments(xmlPath);
});

var app = builder.Build();

// Инициализация базы данных и заполнение тестовыми данными
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    if (!db.Telemetries.Any())
{
    var random = new Random();
    var now = DateTime.UtcNow;
    var startDate = now.AddHours(-12);
    
    for (int i = 0; i < 100; i++)
    { // Генерация таблицы телеметрика
        db.Telemetries.Add(new Telemetry
        {
            Time = startDate.AddSeconds(i * (12 * 3600 / 100.0)), // Равномерно распределяем по 12 часам
            Speed = random.Next(45, 66),
            Temperature = Math.Round(36.5 + random.NextDouble() * 10, 2),
            Pressure = random.Next(70, 80)
        });
    }
        // Генерация 50 комментариев
        var commentMetrics = new[] { "Скорость", "Температура", "Давление" };
        var commentTexts = new[]
        {
            "Причина отклонения не определена",
            "Отклонение из-за веса продукции",
            "Показатель в норме",
            "Значение снижено",
            "Требуется проверка",
        };

        var comments = new List<Comment>();
        for (int i = 0; i < 50; i++)
        {
            var metric = commentMetrics[random.Next(commentMetrics.Length)];
            
            // Случайное смещение от startDate в пределах 12 часов
            var startOffsetSeconds = random.Next(0, (int)(now - startDate).TotalSeconds);
            var startTime = startDate.AddSeconds(startOffsetSeconds);
            
            // Длительность интервала от 5 минут до 3 часов
            var durationMinutes = random.Next(5, 181);
            var endTime = startTime.AddMinutes(durationMinutes);
            
            var text = commentTexts[random.Next(commentTexts.Length)];
            
            comments.Add(new Comment
            {
                MetricName = metric,
                StartTime = startTime,
                EndTime = endTime,
                Text = text
            });
        }

        db.Comments.AddRange(comments);

        db.SaveChanges();
    }
}

// Конвейер обработки запросов
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.UseResponseCaching();
app.MapControllers();

if (app.Environment.IsProduction())
{
    var spaBuildPath = Path.Combine(app.Environment.ContentRootPath, "ClientApp", "build");
    if (Directory.Exists(spaBuildPath))
    {
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(spaBuildPath),
            RequestPath = ""
        });

        app.MapFallbackToFile("index.html", new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(spaBuildPath)
        });
    }
}

app.Run();