import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import axios from 'axios';
import DateRangePicker from './components/DateRangePicker';
import ViewToggle from './components/ViewToggle';
import TelemetryChart from './components/TelemetryChart';
import TelemetryTable from './components/TelemetryTable';
import CommentsTable from './components/CommentsTable';

function App() {
  // Текущая дата и время
  const now = new Date();
  // Начальное значение интервала дата 12 часов назад
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

  // Состояния для хранения выбранного интервала дат
  const [from, setFrom] = useState(twelveHoursAgo);
  const [to, setTo] = useState(now);

  // Состояние для переключения между графиком и таблицей
  const [view, setView] = useState('chart');

  // Состояние для данных телеметрии полученных с API
  const [telemetryData, setTelemetryData] = useState([]);

  // Состояние для обновления таблицы комментариев, когда будут изменнеия в CommentsTable
  const [commentsRefresh] = useState(0);

  // Загрузка данных при изменении интервала даты
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await axios.get(`/api/telemetry?from=${from.toISOString()}&to=${to.toISOString()}`); //Отправляем GET запрос
        setTelemetryData(res.data);
      } catch (error) {
        console.error('Ошибка загрузки телеметрии', error); // Если есть ошибка, то выводим её
      }
    };
    fetchTelemetry(); // Если все хорошо, то сохраняем полученные данные в состояние
  }, [from, to]);

  // Обработчики изменения начальной и конечной даты
  const handleFromChange = (newValue) => setFrom(newValue);
  const handleToChange = (newValue) => setTo(newValue);
  // Обработчик переключения график/таблица
  const handleViewChange = (newView) => setView(newView);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок страницы */}
      <Typography variant="h4" gutterBottom>Отчёт по телеметрии</Typography>

      {/* Блок выбора интервала дат */}
      <DateRangePicker from={from} to={to} onFromChange={handleFromChange} onToChange={handleToChange} />
      
      {/* Блок переключения */}
      <ViewToggle view={view} onViewChange={handleViewChange} />

      {/* Рендеринг отоброжения, если view === chart, показываем график, иначе таблицу  */}
      {view === 'chart'
        ? <TelemetryChart data={telemetryData} />
        : <TelemetryTable data={telemetryData} />
      }

      {/* Заголовок раздела комментариев */}
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Комментарии к показателям</Typography>
      
      {/* Таблица комментариев, которая обновляется при изменении интервала дат и по триггеру refreshTrigger */}
      <CommentsTable from={from} to={to} refreshTrigger={commentsRefresh} />
    </Container>
  );
}

export default App;