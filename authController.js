const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Модели пользователей (пример)
const User = require('../models/user'); // Замените на вашу модель пользователя
const JWT_SECRET = process.env.JWT_SECRET || 'Aa650652';  // Добавьте это в код

// Регистрация нового пользователя
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Проверка, существует ли пользователь
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Пользователь уже существует' });
    }

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создание нового пользователя
    user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Генерация JWT токена
    const payload = {
      user: {
        id: user.id,
      },
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
};

// Вход пользователя
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Проверка пользователя
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Неверные учетные данные' });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Неверные учетные данные' });
    }

    // Генерация JWT токена
    const payload = {
      user: {
        id: user.id,
      },
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
};

// Получение данных пользователя (защищенный маршрут)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
};
