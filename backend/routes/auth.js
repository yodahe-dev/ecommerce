const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const nodemailer = require('nodemailer');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Function to generate a 6-digit code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit random number
}

// Function to send OTP via email
async function sendEmail(email, otp) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'yodijone@gmail.com', // Your email
      pass: 'dqekzznvwnkuurwm',   // Your app password
    },
  });

  let mailOptions = {
    from: 'system',
    to: email,
    subject: 'Email Verification OTP',
    html: `Your 6-digit OTP code is: <strong>${otp}</strong>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP sent to email');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Signup Route
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    // Create the user and store the hashed password
    const user = await User.create({ username, email, password: hash });

    // Generate OTP and save it in the database
    const otp = generateCode();
    user.verificationCode = otp;
    await user.save();

    // Send the OTP email to the user's provided email
    await sendEmail(email, otp);

    res.status(201).json({ message: 'Signup successful! Please check your email to verify.' });
  } catch (err) {
    res.status(400).json({ error: 'User already exists' });
  }
});

// Verify OTP Route
router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check if the OTP entered by the user matches the OTP stored in the database
    if (user.verificationCode !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Mark the user as verified and clear the OTP
    user.isVerified = true;
    user.verificationCode = null; // Clear OTP after successful verification
    await user.save();

    res.json({ message: 'User verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

  if (!user.isVerified) {
    return res.status(400).json({ error: 'Please verify your email first' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Profile Route (protected)
router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      include: {
        model: Role,
        as: 'role',
        attributes: ['name'],
      },
    });
    res.json(user);
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
});

module.exports = router;
