const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/user'); // Модель пользователя
const session = require('express-session');

// Function for registering a user
async function register(req, res) {
  const { username, password, firstName, lastName, age, gender } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).send('User already exists');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = new User({
    username,
    password: hashedPassword,
    firstName,
    lastName,
    age,
    gender,
    role: 'editor', // Default role is editor
    failedLoginAttempts: 0 // Track failed login attempts
  });

  try {
    await newUser.save();

    // Send the welcome email
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
        console.log(err);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.redirect('/login'); // Redirect to login after successful registration
  } catch (error) {
    console.error(error);
    res.status(500).send('Error during registration');
  }
}

// Login function
async function login(req, res) {
  const { username, password } = req.body;

  // Find the user by username
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).send('Invalid username or password');
  }

  // Check for failed login attempts
  if (user.failedLoginAttempts >= 3) {
    return res.status(403).send('Your account is locked due to too many failed login attempts');
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    // Increment failed login attempts
    user.failedLoginAttempts += 1;
    await user.save();

    return res.status(400).send('Invalid username or password');
  }

  // Reset failed login attempts on successful login
  user.failedLoginAttempts = 0;
  await user.save();

  // Create a session for the user
  req.session.userId = user._id;
  req.session.role = user.role;

  res.redirect('/'); // Redirect to the home page after successful login
}

// Logout function
function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Failed to logout');
    }

    res.redirect('/login'); // Redirect to the login page after logging out
  });
}

// Export the functions
module.exports = {
  register,
  login,
  logout,
};
