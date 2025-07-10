import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
const port = process.env.API_SERVER_PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: parseInt(process.env.SMTP_PORT || '587') === 465,
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password'
  }
});

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, message, name, email, replyTo } = req.body;
    
    // Validate required fields
    if (!subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Subject and message are required' 
      });
    }

    // Determine recipient
    const recipient = to || process.env.SUPPORT_EMAIL || 'support@dronera.com';
    const fromEmail = process.env.FROM_EMAIL || 'noreply@dronera.com';

    // Prepare email data
    const mailOptions = {
      from: fromEmail,
      to: recipient,
      subject: subject,
      replyTo: replyTo || email || fromEmail,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00ccff;">DRONERA Support Message</h2>
          <p><strong>From:</strong> ${name || 'Anonymous'} ${email ? `(${email})` : ''}</p>
          <div style="border-left: 4px solid #00ccff; padding-left: 15px; margin: 20px 0;">
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This email was sent from the DRONERA platform.
          </p>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    res.status(200).json({ 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send email' 
    });
  }
});

// Support request endpoint
app.post('/api/support-request', async (req, res) => {
  try {
    const { userEmail, subject, message, priority = 'medium' } = req.body;
    
    // Validate required fields
    if (!subject || !message || !userEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email, subject and message are required' 
      });
    }

    const supportEmail = process.env.SUPPORT_EMAIL || 'support@dronera.com';
    const fromEmail = process.env.FROM_EMAIL || 'noreply@dronera.com';

    // Format message with priority
    const formattedMessage = `
Priority: ${priority.toUpperCase()}

Message:
${message}
    `;

    // Prepare email data
    const mailOptions = {
      from: fromEmail,
      to: supportEmail,
      subject: `Website Contact Form: ${subject}`,
      replyTo: userEmail,
      text: formattedMessage,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00ccff;">DRONERA Support Request</h2>
          <p><strong>From:</strong> ${userEmail}</p>
          <p><strong>Priority:</strong> <span style="color: ${
            priority === 'high' ? '#ff3333' : 
            priority === 'medium' ? '#ffaa33' : 
            '#33aa33'
          };">${priority.toUpperCase()}</span></p>
          <div style="border-left: 4px solid #00ccff; padding-left: 15px; margin: 20px 0;">
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This support request was sent from the DRONERA platform.
          </p>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Support request sent successfully:', info.messageId);

    res.status(200).json({ 
      success: true, 
      messageId: info.messageId,
      message: 'Support request sent successfully' 
    });
  } catch (error) {
    console.error('Error sending support request:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send support request' 
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check if SMTP connection is working
    await transporter.verify();
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      smtp: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      smtp: 'disconnected',
      error: error.message
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Email server running at http://localhost:${port}`);
});