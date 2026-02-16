import React from 'react';
import { TextField, Stack } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';

// Выбор интервала дат
export default function DateRangePicker({ from, to, onFromChange, onToChange }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <DateTimePicker
          label="Начальная дата"
          value={from} // Выбранна начальная дата
          onChange={onFromChange} // Колбэк при изменении начальной даты
          renderInput={(params) => <TextField {...params} />}
        />
        <DateTimePicker
          label="Конечная дата"
          value={to} // Выбранна конечная дата
          onChange={onToChange} // Колбэк при изменении конечной даты
          renderInput={(params) => <TextField {...params} />}
        />
      </Stack>
    </LocalizationProvider>
  );
}