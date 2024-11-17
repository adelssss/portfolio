const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios'); // Подключаем axios для API запросов

dotenv.config();

const app = express();

// Подключение к базе данных MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

// Установка EJS как шаблонизатор
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Настройка сессий
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Главная страница
app.get('/', (req, res) => {
  res.render('index', { items: [] });  // Здесь вы можете передать нужные данные
});

// Страница новостей
app.get('/news', async (req, res) => {
  try {
    // Запрос к API для получения новостей
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'Tokyo',  // Фильтруем по запросу 'Tokyo'
        apiKey: process.env.NEWS_API_KEY,  // Ваш API ключ
      },
    });

    const articles = response.data.articles;  // Получаем статьи из ответа

    // Отправляем статьи в шаблон EJS
    res.render('news', { articles });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).send('Error fetching news');
  }
});

// Импорт маршрутов
const authRoutes = require('./routes/authRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');

app.use(authRoutes);
app.use(portfolioRoutes);



// Запуск сервера
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
