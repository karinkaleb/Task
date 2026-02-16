using System;
using System.ComponentModel.DataAnnotations;
using Report.Data;

namespace Report.Models;

// Модель комментария 
public class Comment
{
    // Уникальный идентификатор комментария
    public int Id { get; set; }
    [Required]
    // Наименование показателя скорость, температура, давление
    public string MetricName { get; set; } = string.Empty; 
    [Required]
    // Начало интервала времени
    public DateTime StartTime { get; set; } 
    [Required]
    // Конец интервала времени
    public DateTime EndTime { get; set; } 
    [Required]
    // Текст комментария
    public string Text { get; set; } = string.Empty;
}