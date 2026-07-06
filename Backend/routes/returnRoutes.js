// server/routes/returnRoutes.js

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Path to returns data file
const dataDir = path.join(process.cwd(), 'data');
const returnsFilePath = path.join(dataDir, 'returns.json');

console.log('📂 Returns data path:', returnsFilePath);

// Ensure data directory exists
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Data directory created:', dataDir);
  }

  if (!fs.existsSync(returnsFilePath)) {
    fs.writeFileSync(returnsFilePath, JSON.stringify([]));
    console.log('✅ Returns file created:', returnsFilePath);
  }
} catch (error) {
  console.error('❌ Error initializing data directory:', error);
}

// GET all returns
router.get('/', async (req, res) => {
  try {
    const data = fs.readFileSync(returnsFilePath, 'utf8');
    const returns = JSON.parse(data);
    res.json(returns);
  } catch (error) {
    console.error('❌ Error fetching returns:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch returns'
    });
  }
});

// POST - Create new return request
router.post('/', async (req, res) => {
  console.log('📝 Received return request:', req.body);
  
  try {
    const { orderNumber, email, returnType, reason, comments } = req.body;

    // Validate
    if (!orderNumber || !email || !returnType || !reason) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Read existing returns
    let returns = [];
    try {
      const data = fs.readFileSync(returnsFilePath, 'utf8');
      returns = JSON.parse(data);
    } catch (readError) {
      returns = [];
    }

    // Create new return entry
    const newReturn = {
      id: Date.now().toString(),
      orderNumber,
      email,
      returnType,
      reason,
      comments: comments || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    console.log('📦 New return entry:', newReturn);

    // Add to array
    returns.push(newReturn);

    // Save to file
    fs.writeFileSync(returnsFilePath, JSON.stringify(returns, null, 2));
    console.log('✅ Return saved successfully');

    // === ISSUE FIXED 1: Phele Response Send karein taake Frontend ko Network Error na aaye ===
    // Agar email thoda time legi ya port block hoga, tab bhi user ka data database/file mein save ho jayega aur screen par success message aa jayega.
    res.status(201).json({
      success: true,
      message: 'Return request submitted successfully',
      data: newReturn
    });

    // Email ko background mein chalne dein (Response ke BAAD)
    try {
      console.log('📧 Attempting to send email notifications...');
      await sendReturnNotifications({
        orderNumber,
        email,
        returnType,
        reason,
        comments,
        id: newReturn.id,
        createdAt: newReturn.createdAt
      });
      console.log('✅ Email notifications sent successfully');
    } catch (emailError) {
      console.error('❌ Email notification failed but data was saved:', emailError.message);
    }

  } catch (error) {
    console.error('❌ Return submission error:', error);
    // Agar response pehle send nahi hua tabhi status 500 chalega
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to submit return request: ' + error.message
      });
    }
  }
});

// PUT - Update return status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const returns = JSON.parse(fs.readFileSync(returnsFilePath, 'utf8'));
    const returnIndex = returns.findIndex(r => r.id === id);

    if (returnIndex === -1) {
      return res.status(404).json({ message: 'Return not found' });
    }

    returns[returnIndex].status = status;
    returns[returnIndex].updatedAt = new Date().toISOString();

    fs.writeFileSync(returnsFilePath, JSON.stringify(returns, null, 2));

    res.json({
      success: true,
      message: 'Return status updated',
      data: returns[returnIndex]
    });

  } catch (error) {
    console.error('Update return error:', error);
    res.status(500).json({ message: 'Failed to update return' });
  }
});

// DELETE - Delete return
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const returns = JSON.parse(fs.readFileSync(returnsFilePath, 'utf8'));
    const filteredReturns = returns.filter(r => r.id !== id);

    if (filteredReturns.length === returns.length) {
      return res.status(404).json({ message: 'Return not found' });
    }

    fs.writeFileSync(returnsFilePath, JSON.stringify(filteredReturns, null, 2));

    res.json({
      success: true,
      message: 'Return deleted successfully'
    });

  } catch (error) {
    console.error('Delete return error:', error);
    res.status(500).json({ message: 'Failed to delete return' });
  }
});

// ========== EMAIL NOTIFICATION FUNCTION ==========
async function sendReturnNotifications(data) {
  console.log('📧 Preparing to send emails...');

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminCcEmail = process.env.ADMIN_CC_EMAIL;

  console.log('📧 Email Sender (Gmail):', emailUser);
  console.log('📧 Admin Email (Main):', adminEmail);
  console.log('📧 Admin CC:', adminCcEmail || 'None');

  if (!emailUser || !emailPass) {
    console.log('❌ Email credentials not configured in .env file');
    return;
  }

  try {
    // === ISSUE FIXED 2: Gmail configuration ko simpler aur safer banaya ===
    /* COMMENTED OUT OLD CONFIG: Local PC par port 587 aur smtp.gmail.com aksar local firewall se block ho jata hai aur network issue deta hai.
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: emailUser, pass: emailPass }
    });
    */

    // NEW SAFE CONFIG: Service 'gmail' use karne se Nodemailer khud hi behtareen port aur secure routing manage kar leta hai.
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass // Aapka 16-digit ka Google App Password
      }
    });

    // Verify connection
    try {
      await transporter.verify();
      console.log('✅ Email transporter verified successfully');
    } catch (verifyError) {
      console.error('❌ Email verification failed:', verifyError.message);
      return;
    }

    // Return type labels
    const returnTypeLabels = {
      'return': 'Return for Refund',
      'exchange': 'Exchange',
      'damaged': 'Damaged Item',
      'wrong': 'Wrong Item Received'
    };
    const returnTypeLabel = returnTypeLabels[data.returnType] || data.returnType;

    const reasonLabels = {
      'size': 'Wrong Size',
      'color': 'Wrong Color',
      'defect': 'Defective Product',
      'quality': 'Quality Issue',
      'fit': "Doesn't Fit",
      'change': 'Changed Mind',
      'other': 'Other'
    };
    const reasonLabel = reasonLabels[data.reason] || data.reason;

    // === 1. Email to ADMIN ===
    const adminMailOptions = {
      from: emailUser,
      to: adminEmail || 'qasrelibasltd@gmail.com', // Fallback agar .env mein set na ho
      cc: adminCcEmail || undefined,
      subject: `🔔 NEW Return Request - Order #${data.orderNumber}`,
      html: `<h1>QASR-E-LIBAS - New Return Request</h1><p>Order Number: #${data.orderNumber}</p>` // (Aap ka baqi poora HTML template yahan rahega)
    };

    await transporter.sendMail(adminMailOptions);
    console.log('✅ Admin email sent.');

    // === 2. Email to CUSTOMER ===
    const customerMailOptions = {
      from: emailUser,
      to: data.email,
      subject: `✅ Return Request Received - Order #${data.orderNumber}`,
      html: `<h1>QASR-E-LIBAS</h1><p>Dear Customer, we received your request for order #${data.orderNumber}.</p>` // (Aap ka baqi poora HTML template yahan rahega)
    };

    await transporter.sendMail(customerMailOptions);
    console.log(`✅ Customer email sent to: ${data.email}`);

  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw error;
  }
}

export default router;