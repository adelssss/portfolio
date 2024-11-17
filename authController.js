const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const generate2FACode = require("../utils/2facode"); 

exports.register = async (req, res) => {
  const { username, password, firstName, lastName, age, gender, twoFactorAuth } = req.body;
  try {
    const twoFactorEnabled = twoFactorAuth ? true : false;
    const twoFactorCode = generate2FACode(); 

    const newUser = new User({
      username,
      password,
      firstName,
      lastName,
      age,
      gender,
      twoFactorEnabled,
      twoFactorCode, 
    });

    await newUser.save();
    await sendEmail(newUser.username, 'Your 2FA Code', `Your 2FA code is: ${twoFactorCode}`);

    res.redirect('login');
  } catch (error) {
    console.error(error);
    res.status(500).send("Error registering user");
  }
};

exports.login = async (req, res) => {
  const { username, password, twoFactorCode } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send("Invalid credentials");
    }

    if (user.twoFactorEnabled) {
      if (twoFactorCode !== user.twoFactorCode) {
        return res.status(401).send("Invalid 2FA code");
      }
    }

    req.session.user = user;
    res.redirect("/"); 
  } catch (error) {
    console.error(error);
    res.status(500).send("Error logging in");
  }
};
