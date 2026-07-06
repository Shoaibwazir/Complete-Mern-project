import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEmailConfig, sendEmail } from '../utils/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const dataDir = path.join(process.cwd(), 'data');
const contactsFilePath = path.join(dataDir, 'contacts.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(contactsFilePath)) {
  fs.writeFileSync(contactsFilePath, JSON.stringify([]));
}

const emailTemplate = (title, rows) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 12px; }
    .header { text-align: center; border-bottom: 3px solid #c5a880; padding-bottom: 16px; margin-bottom: 20px; }
    .header h1 { color: #1a1a2e; margin: 0; }
    .gold { color: #c5a880; }
    .row { padding: 10px 0; border-bottom: 1px solid #eee; }
    .label { font-weight: 600; color: #555; display: block; margin-bottom: 4px; }
    .value { color: #1a1a2e; }
    .message-box { background: #f9fafb; padding: 16px; border-radius: 8px; margin-top: 12px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>QASR-E-<span class="gold">LIBAS</span></h1>
      <p style="color:#666;margin:8px 0 0;">${title}</p>
    </div>
    ${rows}
  </div>
</body>
</html>`;

// GET all contacts (for admin review)
router.get('/', async (req, res) => {
  try {
    const contacts = JSON.parse(fs.readFileSync(contactsFilePath, 'utf8'));
    res.json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// POST new contact message
// contactRoutes.js - SIRF YEH PART FIX KAREIN

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields',
      });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    const entry = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || '',
      subject: subject.trim(),
      message: message.trim(),
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    // Save to file
    const contacts = JSON.parse(fs.readFileSync(contactsFilePath, 'utf8'));
    contacts.push(entry);
    fs.writeFileSync(contactsFilePath, JSON.stringify(contacts, null, 2));
    console.log('✅ Contact saved to file:', entry.id);

    // ✅ IMMEDIATE RESPONSE TO USER
    res.status(201).json({
      success: true,
      message: 'Message sent successfully. We will respond within 24 hours.',
      data: entry,
    });

    // ============================================
    // ✅ FIX: EMAIL SENDING PART
    // ============================================
    try {
      // ✅ Get admin email from .env
      const { adminEmail, adminCcEmail, emailUser } = getEmailConfig();
      
      // ✅ DEBUG - Check if admin email is set
      console.log('📧 ADMIN EMAIL CONFIGURED:', adminEmail);
      console.log('📧 EMAIL USER:', emailUser);
      
      // ✅ IF NO ADMIN EMAIL, USE A DEFAULT OR THROW ERROR
      if (!adminEmail) {
        console.error('❌ ADMIN_EMAIL not set in .env!');
        // Use a fallback email
        const fallbackEmail = 'qasrelibasltd@gmail.com';
        console.log(`📧 Using fallback email: ${fallbackEmail}`);
        
        // Send to fallback
        await sendEmail({
          to: fallbackEmail,
          cc: adminCcEmail || undefined,
          replyTo: entry.email,
          subject: `🔔 NEW Contact: ${entry.name} - ${entry.subject}`,
          html: generateAdminEmail(entry),
        });
        console.log('✅ Email sent to fallback:', fallbackEmail);
      } else {
        // ✅ Send to configured admin email
        await sendEmail({
          to: adminEmail,
          cc: adminCcEmail || undefined,
          replyTo: entry.email,
          subject: `🔔 NEW Contact: ${entry.name} - ${entry.subject}`,
          html: generateAdminEmail(entry),
        });
        console.log('✅ Admin email sent to:', adminEmail);
      }

      // ✅ Customer Confirmation
      await sendEmail({
        to: entry.email,
        subject: '✅ We received your message — QASR-E-LIBAS LTD',
        html: generateCustomerEmail(entry),
      });
      console.log('✅ Customer confirmation sent to:', entry.email);

    } catch (emailError) {
      console.error('❌ Email error:', emailError.message);
      console.error('Full error:', emailError);
    }

  } catch (error) {
    console.error('❌ Contact submission error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to send message' });
    }
  }
});

// ✅ Helper function for admin email
function generateAdminEmail(entry) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 30px; }
    .header { text-align: center; border-bottom: 3px solid #c6a43f; padding-bottom: 20px; margin-bottom: 20px; }
    .header h1 { color: #1a1a2e; margin: 0; }
    .gold { color: #c6a43f; }
    .admin-badge { background: #c6a43f; color: white; padding: 6px 20px; border-radius: 20px; display: inline-block; font-size: 14px; margin-top: 10px; }
    .field { padding: 10px 0; border-bottom: 1px solid #eee; }
    .label { font-weight: 600; color: #555; display: block; margin-bottom: 4px; }
    .value { color: #1a1a2e; }
    .message-box { background: #f9fafb; padding: 16px; border-radius: 8px; margin-top: 8px; white-space: pre-wrap; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 12px; }
    .actions { margin-top: 20px; padding: 15px; background: #f0f7ff; border-radius: 8px; text-align: center; }
    .actions a { color: #c6a43f; text-decoration: none; font-weight: 600; margin: 0 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>QASR-E-<span class="gold">LIBAS</span></h1>
      <div class="admin-badge">🔔 ADMIN NOTIFICATION</div>
      <p style="color: #666; margin-top: 10px;">New Contact Form Submission</p>
    </div>
    
    <div class="field">
      <span class="label">👤 Name</span>
      <span class="value"><strong>${entry.name}</strong></span>
    </div>
    <div class="field">
      <span class="label">📧 Email</span>
      <span class="value"><a href="mailto:${entry.email}" style="color: #c6a43f;">${entry.email}</a></span>
    </div>
    ${entry.phone ? `
    <div class="field">
      <span class="label">📞 Phone</span>
      <span class="value">${entry.phone}</span>
    </div>
    ` : ''}
    <div class="field">
      <span class="label">📌 Subject</span>
      <span class="value"><strong>${entry.subject}</strong></span>
    </div>
    <div class="field">
      <span class="label">💬 Message</span>
      <div class="message-box">${entry.message}</div>
    </div>
    <div class="field">
      <span class="label">🕐 Received</span>
      <span class="value">${new Date(entry.createdAt).toLocaleString()}</span>
    </div>
    
    <div class="actions">
      <strong>⚡ Quick Actions:</strong>
      <a href="mailto:${entry.email}?subject=Re: ${encodeURIComponent(entry.subject)}">📧 Reply</a>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/contacts">👁️ View All</a>
    </div>
    
    <div class="footer">
      <p>QASR-E-LIBAS LTD — Automated Notification</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ✅ Helper function for customer email
function generateCustomerEmail(entry) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 30px; }
    .header { text-align: center; border-bottom: 3px solid #c6a43f; padding-bottom: 20px; margin-bottom: 20px; }
    .header h1 { color: #1a1a2e; margin: 0; }
    .gold { color: #c6a43f; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>QASR-E-<span class="gold">LIBAS</span></h1>
      <p style="color: #666;">Thank You for Contacting Us</p>
    </div>
    
    <p>Dear <strong>${entry.name}</strong>,</p>
    <p>Thank you for reaching out to <strong>QASR-E-LIBAS LTD</strong>.</p>
    <p>We have received your message regarding:</p>
    
    <div style="background: #f0f7ff; padding: 16px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #c6a43f;">
      <p style="margin: 0;"><strong>📌 ${entry.subject}</strong></p>
      <p style="margin: 8px 0 0 0; color: #555;">${entry.message}</p>
    </div>
    
    <p>Our team will review your inquiry and get back to you within <strong>24 hours</strong>.</p>
    
    <p style="margin-top: 20px;">
      Best regards,<br>
      <strong>QASR-E-LIBAS LTD Team</strong>
    </p>
    
    <div class="footer">
      <p>QASR-E-LIBAS LTD — Unit 107 Jubilee Trade Centre, Birmingham B5 6ND, UK</p>
      <p>📧 info@qasrelibas.co.uk | 📞 +44 7460 816860</p>
    </div>
  </div>
</body>
</html>
  `;
}

export default router;