import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


// Отображение данных в виде графика
export default function TelemetryChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}> {/* Массив данных содержит time, speed, temperature, pressure */}
        <CartesianGrid strokeDasharray="3 3" />
        {/* Ось X отображает время */}
        <XAxis dataKey="time" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
        {/* Левая ось Y для скорости и температуры */}
        <YAxis yAxisId="left" />
        {/* Правая ось Y для давления */}
        <YAxis yAxisId="right" orientation="right" />
        {/* Подсказка точки показывает дату и время */}
        <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
        <Legend />
        {/* Линия скорости привязана к левой оси */}
        <Line yAxisId="left" type="monotone" dataKey="speed" stroke="#8884d8" name="Скорость" />
        {/* Линия температуры привязана к левой оси */}
        <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#82ca9d" name="Температура" />
        {/* Линия давления привязана к правой оси */}
        <Line yAxisId="right" type="monotone" dataKey="pressure" stroke="#ffc658" name="Давление" />
      </LineChart>
    </ResponsiveContainer>
  );
}