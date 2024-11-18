const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/user');

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  const { username, password, firstName, lastName, age, gender } = req.body;

  if (!username || !password || !firstName || !lastName || !age || !gender) {
    return res.render('register', { errorMessage: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('register', { errorMessage: 'User with this username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      age,
      gender,
      role: 'editor',
      failedLoginAttempts: 0,
    });

    await newUser.save();

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

    res.redirect('/login');
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).render('register', { errorMessage: 'An error occurred during registration' });
  }
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('login', { errorMessage: 'Login and password are required' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.render('login', { errorMessage: 'Invalid username or password' });
    }

    if (user.failedLoginAttempts >= 3) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
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

      return res.render('login', { errorMessage: 'Your account is locked due to too many failed login attempts' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      await user.save();
      return res.render('login', { errorMessage: 'Invalid username or password' });
    }

    user.failedLoginAttempts = 0;
    await user.save();

    req.session.userId = user._id;
    req.session.role = user.role;

    res.redirect('/');
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).render('login', { errorMessage: 'An error occurred during login' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Failed to logout');
    }

    res.redirect('/login');
  });
});

module.exports = router;
