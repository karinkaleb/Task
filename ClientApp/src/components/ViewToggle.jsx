import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

// Переключатель
export default function ViewToggle({ view, onViewChange }) {
  return (
    <ToggleButtonGroup
      color="primary"
      value={view} // Текущий режим график или таблица
      exclusive // Только один выбранный вариант
      onChange={(e, val) => val && onViewChange(val)}  // Игнорируем снятие выбора
      sx={{ mb: 2 }}
    >
      <ToggleButton value="chart">График</ToggleButton>
      <ToggleButton value="table">Таблица</ToggleButton>
    </ToggleButtonGroup>
  );
}