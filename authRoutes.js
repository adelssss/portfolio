const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/user');

// Страница регистрации (GET запрос)
router.get('/register', (req, res) => {
  res.render('register'); // Отправляем форму для регистрации
});

// Обработчик регистрации (POST запрос)
router.post('/register', async (req, res) => {
  const { username, password, firstName, lastName, age, gender } = req.body;

  // Проверка на пустые поля
  if (!username || !password || !firstName || !lastName || !age || !gender) {
    return res.render('register', { errorMessage: 'Все поля обязательны для заполнения' });
  }

  try {
    // Проверяем, если пользователь уже существует
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('register', { errorMessage: 'Пользователь с таким именем уже существует' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем нового пользователя
    const newUser = new User({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      age,
      gender,
      role: 'editor', // По умолчанию роль - редактор
      failedLoginAttempts: 0, // Начальное количество неудачных попыток
    });

    // Сохраняем нового пользователя
    await newUser.save();

    // Отправка welcome email с использованием Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: username,
      subject: 'Welcome to the Portfolio Platform',
      text: `Hi ${firstName},\n\nThank you for registering on our portfolio platform!\n\nBest regards,\nPortfolio Team`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.redirect('/login'); // После успешной регистрации перенаправляем на страницу входа
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).render('register', { errorMessage: 'Произошла ошибка при регистрации' });
  }
});

// Страница логина (GET запрос)
router.get('/login', (req, res) => {
  res.render('login'); // Отправляем форму для логина
});

// Обработчик логина (POST запрос)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Проверка на пустые поля
  if (!username || !password) {
    return res.render('login', { errorMessage: 'Логин и пароль обязательны для ввода' });
  }

  try {
    // Находим пользователя по имени
    const user = await User.findOne({ username });
    if (!user) {
      return res.render('login', { errorMessage: 'Неверный логин или пароль' });
    }

    // Проверка на превышение количества неудачных попыток
    if (user.failedLoginAttempts >= 3) {
      // Отправка уведомления об увеличении неудачных попыток
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Админ или безопасность
        subject: 'Warning: Multiple Failed Login Attempts',
        text: `There have been multiple failed login attempts for the user: ${username}.`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error('Failed login attempt notification error:', err);
        } else {
          console.log('Failed login attempt notification sent: ' + info.response);
        }
      });

      return res.render('login', { errorMessage: 'Ваша учетная запись заблокирована из-за слишком большого количества неудачных попыток входа' });
    }

    // Сравниваем пароли
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Увеличиваем количество неудачных попыток
      user.failedLoginAttempts += 1;
      await user.save();
      return res.render('login', { errorMessage: 'Неверный логин или пароль' });
    }

    // Если все верно, сбрасываем количество неудачных попыток
    user.failedLoginAttempts = 0;
    await user.save();

    // Если все верно, создаем сессию
    req.session.userId = user._id;
    req.session.role = user.role;

    // Перенаправляем на главную страницу
    res.redirect('/');
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).render('login', { errorMessage: 'Произошла ошибка при входе' });
  }
});

// Логаут (GET запрос)
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Failed to logout');
    }

    res.redirect('/login'); // Перенаправляем на страницу логина после логаута
  });
});

module.exports = router;
