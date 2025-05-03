const nodemailer = require('nodemailer');

// Function to generate a 6-digit code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit random number
}

async function sendEmail() {
  // Generate the 6-digit code
  const otp = generateCode();

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'yodijone@gmail.com',
      pass: 'dqekzznvwnkuurwm' // your app password, no spaces
    }
  });

  let mailOptions = {
    from: 'system',
    to: 'yodahegaga@gmail.com',
    subject: `${otp}`,
    html: `Your 6-digit OTP code ` // Bold OTP code
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent');
    console.log(+"1" + +"2" + "3" + +"4")
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = sendEmail;
