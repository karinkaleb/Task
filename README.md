# Веб-приложение отчёт по телеметрии
Проект создан на основе шаблона React с ASP.NET Core.

# Технологический стек
## Backend
### .NET 8.0 ASP.NET Core
### Entity Framework Core SQLite
### SQLite файл telemetry.db, просмотр БД приложение DB Browser for SQLite
### Swagger документация API
### MemoryCache/ResponseCache кэширование телеметрии

## Frontend
### React шаблон CRA
### MUI компоненты интерфейса
### Axios HTTP запросы к API
### Recharts график телеметрии
### MUI X Data Grid таблицы
### date-fns @mui/x-date-pickers выбор дат

# Запуск проекта
## Запуск backend
### dotnet run
## Запуск frontend
### cd ClientApp
### npm install (первом запуске)
### npm start

### Создается файл telemetry.db в корне проекта, его можно открыть через приложение DB Browser for SQLite.
### БД автоматически заполнится тестовыми данными (100 записей за последние 12 часов и 50 комментариев).

### Swagger доступен по адресу https://localhost:5001/swagger
### Приложение откроется по адресу https://localhost:3000


