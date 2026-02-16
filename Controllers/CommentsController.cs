using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Report.Data;
using Report.Models;

namespace Report.Controllers;

// Документация Swagger api

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<CommentsController> _logger;

    public CommentsController(AppDbContext context, ILogger<CommentsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Получить комментарии, пересекающиеся с заданным интервалом.
    /// </summary>
    /// <param name="from">Начало интервала</param>
    /// <param name="to">Конец интервала</param>
    [HttpGet]
    public async Task<IActionResult> GetComments([FromQuery] DateTime from, [FromQuery] DateTime to)
    {
        // Принудительно приводим к UTC, чтобы избежать неявного преобразования в локальное время сервера
        if (from.Kind != DateTimeKind.Utc) from = from.ToUniversalTime();
        if (to.Kind != DateTimeKind.Utc) to = to.ToUniversalTime();

        _logger.LogInformation("Запрос комментариев с {From} по {To}", from, to);

        var comments = await _context.Comments
            .Where(c => c.StartTime <= to && c.EndTime >= from)
            .OrderBy(c => c.StartTime)
            .ToListAsync();

        // Явно указываем, что даты хранятся в UTC, чтобы сериализатор добавил суффикс 'Z'
        foreach (var comment in comments)
        {
            comment.StartTime = DateTime.SpecifyKind(comment.StartTime, DateTimeKind.Utc);
            comment.EndTime = DateTime.SpecifyKind(comment.EndTime, DateTimeKind.Utc);
        }

        return Ok(comments);
    }

    /// <summary>
    /// Получить комментарий по ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetComment(int id)
    {
        var comment = await _context.Comments.FindAsync(id);
        if (comment == null)
            return NotFound();

        comment.StartTime = DateTime.SpecifyKind(comment.StartTime, DateTimeKind.Utc);
        comment.EndTime = DateTime.SpecifyKind(comment.EndTime, DateTimeKind.Utc);

        return Ok(comment);
    }

    /// <summary>
    /// Создать новый комментарий.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateComment([FromBody] Comment comment)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Убедимся, что пришедшие даты помечены как UTC (если они уже в UTC, ничего не изменится)
        comment.StartTime = DateTime.SpecifyKind(comment.StartTime, DateTimeKind.Utc);
        comment.EndTime = DateTime.SpecifyKind(comment.EndTime, DateTimeKind.Utc);

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        comment.StartTime = DateTime.SpecifyKind(comment.StartTime, DateTimeKind.Utc);
        comment.EndTime = DateTime.SpecifyKind(comment.EndTime, DateTimeKind.Utc);

        return CreatedAtAction(nameof(GetComment), new { id = comment.Id }, comment);
    }

    /// <summary>
    /// Обновить существующий комментарий.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateComment(int id, [FromBody] Comment comment)
    {
        if (id != comment.Id)
            return BadRequest("ID в запросе и в объекте не совпадают");

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Приводим даты к UTC перед сохранением
        comment.StartTime = DateTime.SpecifyKind(comment.StartTime, DateTimeKind.Utc);
        comment.EndTime = DateTime.SpecifyKind(comment.EndTime, DateTimeKind.Utc);

        _context.Entry(comment).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Comments.Any(c => c.Id == id))
                return NotFound();
            throw;
        }
        return NoContent();
    }

    /// <summary>
    /// Удалить комментарий.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(int id)
    {
        var comment = await _context.Comments.FindAsync(id);
        if (comment == null)
            return NotFound();

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}