// user.js (модель пользователя для MongoDB)

const mongoose = require('mongoose');

// Схема пользователя
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
