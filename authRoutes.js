const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/user');

router.post('/register', async (req, res) => {
  const { username, password, firstName, lastName, age, gender } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    password: hashedPassword,
    firstName,
    lastName,
    age,
    gender
  });

  await newUser.save();

  // Send welcome email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: username,
    subject: 'Welcome to the Portfolio Platform',
    text: 'Thank you for registering!'
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  res.redirect('/login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user && await bcrypt.compare(password, user.password)) {
    req.session.userId = user._id;
    req.session.role = user.role;
    return res.redirect('/');
  }

  res.redirect('/login');
});

module.exports = router;
