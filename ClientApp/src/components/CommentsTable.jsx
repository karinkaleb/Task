import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Stack } from '@mui/material';
import axios from 'axios';

// Показатели
const metricOptions = ['Скорость', 'Температура', 'Давление'];

// Компонент для отображения и редактирования комментариев
export default function CommentsTable({ from, to, refreshTrigger }) {
  const [comments, setComments] = useState([]); // Список комментариев полученных с сервера
  const [loading, setLoading] = useState(false); // Загрузка данных
  const [open, setOpen] = useState(false); // Состояние окна
  const [editingComment, setEditingComment] = useState(null); // Комментарий который редактируется null создание нового
  const [formData, setFormData] = useState({ metricName: '', startTime: '', endTime: '', text: '' }); // Данные формы
  const [errors, setErrors] = useState({}); // Ошибки валидации полей формы

  // Загрузка комментариев при изменении выбора даты
  React.useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/comments?from=${from.toISOString()}&to=${to.toISOString()}`);
        setComments(res.data);
      } catch (error) {
        console.error('Ошибка загрузки комментариев', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [from, to, refreshTrigger]);

  const formatDateForInput = (isoString) => { // Преобразует UTC ISO-строку в формат
    const date = new Date(isoString); // Дата в формате ISO 2025-02-16T10:30:00Z, чтобы было легче преобразовывать в БД
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`; // Строка вида YYYY-MM-DDTHH:mm
  };

  const handleOpen = (comment = null) => { // Открываем окно для создания нового null/редактирования комментария
    setErrors({});
    if (comment) {
      setEditingComment(comment);
      setFormData({
        metricName: comment.metricName,
        startTime: formatDateForInput(comment.startTime),
        endTime: formatDateForInput(comment.endTime),
        text: comment.text
      });
    } else {
      setEditingComment(null);
      setFormData({ metricName: '', startTime: '', endTime: '', text: '' });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // Изменение полей формы
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Валидация формы перед отправкой
  const validateForm = () => { 
    const newErrors = {};
    // Проверка на пустые значения
    if (!formData.metricName.trim()) {
      newErrors.metricName = 'Выберите показатель';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Укажите начальное время';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'Укажите конечное время';
    }
    if (!formData.text.trim()) {
      newErrors.text = 'Введите комментарий';
    }

    // Проверка корректности дат
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (isNaN(start.getTime())) {
        newErrors.startTime = 'Некорректная дата';
      }
      if (isNaN(end.getTime())) {
        newErrors.endTime = 'Некорректная дата';
      }
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start > end) {
        newErrors.endTime = 'Конечное время не может быть раньше начального';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Сохраняеv комментарий 
  const handleSave = async () => {
    if (!validateForm()) {
      return; // Останавливаем отправку, если есть ошибки
    }

    try {
      const payload = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      };
      if (editingComment) {
        await axios.put(`/api/comments/${editingComment.id}`, { ...payload, id: editingComment.id });
      } else {
        await axios.post('/api/comments', payload);
      }
      handleClose();
      window.location.reload();
    } catch (error) {
      console.error('Ошибка сохранения', error);
    }
  };

  // Удаляем комментарий по идентификатору
  const handleDelete = async (id) => {
    if (window.confirm('Удалить комментарий?')) {
      await axios.delete(`/api/comments/${id}`);
      setComments(comments.filter(c => c.id !== id));
    }
  };

   // Форматирование даты для отображения в таблице
   // Если дата некорректна возвращается исходное значение

  const formatDate = (value) => { // Дата в виде строки
    if (!value) return '';
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  // Колонки таблицы DataGrid
  const columns = [
    { field: 'metricName', headerName: 'Показатель', width: 150 },
    {
      field: 'startTime',
      headerName: 'Начальное время',
      width: 200,
      renderCell: (params) => formatDate(params.value)
    },
    {
      field: 'endTime',
      headerName: 'Конечное время',
      width: 200,
      renderCell: (params) => formatDate(params.value)
    },
    { field: 'text', headerName: 'Комментарий', width: 300 },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => handleOpen(params.row)}>✎</Button>
          <Button size="small" color="error" onClick={() => handleDelete(params.row.id)}>🗑</Button>
        </Stack>
      )
    }
  ];

  return (
    <div style={{ height: 400, width: '100%', marginTop: 20 }}>
      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>
        Добавить комментарий
      </Button>
      <DataGrid
        rows={comments}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        loading={loading}
        disableSelectionOnClick
      />

      {/* Модальное окно для создания/редактирования комментария */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingComment ? 'Редактировать' : 'Новый'} комментарий</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            margin="dense"
            label="Показатель"
            name="metricName"
            value={formData.metricName}
            onChange={handleChange}
            error={!!errors.metricName}
            helperText={errors.metricName}
          >
            {metricOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </TextField>
          <TextField
            fullWidth
            margin="dense"
            label="Начальное время"
            name="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={!!errors.startTime}
            helperText={errors.startTime}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Конечное время"
            name="endTime"
            type="datetime-local"
            value={formData.endTime}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={!!errors.endTime}
            helperText={errors.endTime}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Комментарий"
            name="text"
            multiline
            rows={2}
            value={formData.text}
            onChange={handleChange}
            error={!!errors.text}
            helperText={errors.text}
          />		
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}