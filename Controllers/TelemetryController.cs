using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Report.Data;
using Report.Models;

namespace Report.Controllers;

// Документация Swagger api

[ApiController]
[Route("api/[controller]")]
public class TelemetryController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<TelemetryController> _logger;
    private readonly IMemoryCache _cache;

    public TelemetryController(AppDbContext context, ILogger<TelemetryController> logger, IMemoryCache cache)
    {
        _context = context;
        _logger = logger;
        _cache = cache;
    }

    /// <summary>
    /// Получить телеметрию за указанный период.
    /// </summary>
    /// <param name="from">Начало периода (обязательно)</param>
    /// <param name="to">Конец периода (обязательно)</param>
    /// <returns>Список записей телеметрии</returns>
    [HttpGet]
    [ResponseCache(Duration = 30, VaryByQueryKeys = new[] { "from", "to" })]
    public async Task<IActionResult> GetTelemetry([FromQuery] DateTime from, [FromQuery] DateTime to)
    {
        // Приводим параметры к UTC, чтобы ключ кэша и запрос к БД были однозначны
        if (from.Kind != DateTimeKind.Utc) from = from.ToUniversalTime();
        if (to.Kind != DateTimeKind.Utc) to = to.ToUniversalTime();

        _logger.LogInformation("Запрос телеметрии с {From} по {To}", from, to);

        var cacheKey = $"telemetry_{from:yyyyMMddHHmm}_{to:yyyyMMddHHmm}";
        if (!_cache.TryGetValue(cacheKey, out List<Telemetry> data))
        {
            data = await _context.Telemetries
                .Where(t => t.Time >= from && t.Time <= to)
                .OrderBy(t => t.Time)
                .ToListAsync();

            _cache.Set(cacheKey, data, TimeSpan.FromSeconds(30));
        }

        // Явно указываем, что время хранится в UTC, чтобы сериализатор добавил суффикс 'Z'
        foreach (var item in data)
        {
            item.Time = DateTime.SpecifyKind(item.Time, DateTimeKind.Utc);
        }

        return Ok(data);
    }
}