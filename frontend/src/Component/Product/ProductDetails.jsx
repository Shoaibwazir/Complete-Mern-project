import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass:9614504246363221
  }
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: process.env.ADMIN_EMAIL,
  subject: 'Test Email',
  text: 'This is a test email from your contact form backend!'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});