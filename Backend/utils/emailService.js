import nodemailer from 'nodemailer';
// import dotenv from "dotenv";
// dotenv.config();

export const getEmailConfig = () => ({
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  adminEmail: process.env.ADMIN_EMAIL || 'info@qasrelibas.co.uk',
  adminCcEmail: process.env.ADMIN_CC_EMAIL,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
});
export const createEmailTransporter = async () => {
  const { emailUser, emailPass } = getEmailConfig();

  if (!emailUser || !emailPass) {
    console.log('❌ Email credentials not configured (EMAIL_USER / EMAIL_PASS)');
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: emailUser, pass: emailPass },
  });

  try {
    await transporter.verify();
    return transporter;
  } catch (error) {
    console.error('❌ Email transporter verification failed:', error.message);
    return null;
  }
};

export const sendEmail = async ({ to, cc, subject, html, replyTo }) => {
  const transporter = await createEmailTransporter();
  if (!transporter) {
    throw new Error('Email transporter could not be created — check EMAIL_USER/EMAIL_PASS');
  }

  const { emailUser } = getEmailConfig();

  await transporter.sendMail({
    from: `"QASR-E-LIBAS LTD" <${emailUser}>`,
    to,
    cc: cc || undefined,
    replyTo: replyTo || undefined,
    subject,
    html,
  });

  return true;
};