const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const rateLimit = require('express-rate-limit');
const { User, Role } = require('../models');
const zxcvbn = require('zxcvbn');

require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
  statusCode: 429,
});

async function sendEmail(email, otp) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let mailOptions = {
    from: 'system',
    to: email,
    subject: 'Email Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 18px;">
        <p>Hello,</p>
        <p>Your verification code is:</p>
        <p style="font-size:30px; font-weight:bold; color:blue;">${otp}</p>
        <p>Please use this code to verify your account.</p>
        <p>Thank you.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP sent to email');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  const passwordStrength = zxcvbn(password);
  if (passwordStrength.score < 3) {
    return res.status(400).json({ error: 'Password is too weak. Please use a stronger password.' });
  }

  const hash = await bcrypt.hash(password, 10);

  try {
    const role = await Role.findOne({ where: { name: process.env.DEFAULT_ROLE } });
    if (!role) {
      return res.status(500).json({ error: 'Default role not found' });
    }

    const user = await User.create({ username, email, password: hash, roleId: role.id });

    const otp = generateCode();
    user.verificationCode = otp;
    await user.save();

    await sendEmail(email, otp);

    res.status(201).json({ message: 'Signup successful! Please check your email to verify.' });
  } catch (err) {
    res.status(400).json({ error: 'User already exists' });
  }
}); 

router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.verificationCode !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.json({ message: 'User verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

  if (!user.isVerified) {
    user.verificationCode = null;
    await user.save();

    const otp = generateCode();
    user.verificationCode = otp;
    await user.save();

    await sendEmail(user.email, otp);

    return res.status(400).json({ error: 'Please verify your email first. A new verification code has been sent.' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

router.post('/resend', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'User is already verified' });

    const otp = generateCode();
    user.verificationCode = otp;
    await user.save();

    await sendEmail(email, otp);

    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error resending OTP' });
  }
});

router.post('/enable-2fa', async (req, res) => {
  const user = await User.findOne({ where: { email: req.body.email } });

  const secret = speakeasy.generateSecret({ length: 20 });
  const otpauthUrl = speakeasy.otpauthURL({ secret: secret.ascii, label: user.email, algorithm: 'sha512' });

  QRCode.toDataURL(otpauthUrl, (err, data_url) => {
    if (err) {
      return res.status(500).json({ error: 'Error generating QR code' });
    }
    user.twoFactorSecret = secret.base32;
    user.save();
    res.json({ message: 'QR code generated', qrCodeUrl: data_url });
  });
});

router.post('/verify-2fa', async (req, res) => {
  const { email, token } = req.body;
  const user = await User.findOne({ where: { email } });

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
  });

  if (verified) {
    res.json({ message: '2FA verified successfully' });
  } else {
    res.status(400).json({ error: 'Invalid 2FA token' });
  }
});

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