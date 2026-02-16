using System;
using Report.Data;

namespace Report.Models;

// Модель записи 
public class Telemetry
{
    // Уникальный идентификатор комментария
    public int Id { get; set; }
    // Время фиксации показателей
    public DateTime Time { get; set; }
    // Скорость
    public int Speed { get; set; }
    // Температура
    public double Temperature { get; set; }
    // Давление
    public int Pressure { get; set; }
}