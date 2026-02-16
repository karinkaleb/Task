import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

// Отображение данных в виде таблицы
export default function TelemetryTable({ data }) {
  return (
    <TableContainer component={Paper}> {/* Массив данных содержит id, time, speed, temperature, pressure */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Время</TableCell>
            <TableCell align="right">Скорость</TableCell>
            <TableCell align="right">Температура</TableCell>
            <TableCell align="right">Давление</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              {/* Форматируем время в локальную строку */}
              <TableCell>{new Date(row.time).toLocaleString()}</TableCell>
              <TableCell align="right">{row.speed}</TableCell>
              {/* Температура округлена до двух знаков */}
              <TableCell align="right">{row.temperature.toFixed(2)}</TableCell>
              <TableCell align="right">{row.pressure}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}