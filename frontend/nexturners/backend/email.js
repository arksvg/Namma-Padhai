const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 8001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'arksvgnss@gmail.com',
    pass: 'ldok litf hxhm mjxb'
  },
});

// Generate a random certificate ID
const generateCertificateID = () => {
  return `CERT-${Math.floor(100000 + Math.random() * 900000)}`;
};

// API Endpoint to Send Quiz Score Email
app.post('/send-score-email', async (req, res) => {
  const { userEmail, userName, score, totalQuestions } = req.body;

  if (!userEmail || !userName || score === undefined || !totalQuestions) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const percentage = (score / totalQuestions) * 100;
  const emailDate = new Date().toLocaleDateString();
  const certificateID = generateCertificateID();

  let emailHTML;

  if (percentage > 50) {
    // Certificate Email
    emailHTML = `
      <div style="font-family: 'Arial', sans-serif; text-align: center; padding: 20px; border-radius: 10px; border: 2px solid #4CAF50; max-width: 600px; margin: auto;">
          <h2 style="color: #4CAF50;">🏆 Congratulations! 🏆</h2>
          <h3 style="color: #333;">Certificate of Achievement</h3>
          <p style="font-size: 16px; color: #555;">This is to certify that</p>
          <h2 style="color: #FF5722;">${userName}</h2>
          <p style="font-size: 16px; color: #555;">has successfully completed the quiz with an excellent score of</p>
          <h3 style="color: #1565C0;">✅ ${score}/${totalQuestions} (${percentage.toFixed(2)}%)</h3>
          
          <div style="margin: 20px 0; padding: 10px; background: #E3F2FD; border-radius: 8px;">
              <p style="font-size: 14px; color: #333;">Certificate ID: <strong>${certificateID}</strong></p>
              <p style="font-size: 14px; color: #333;">Date: <strong>${emailDate}</strong></p>
          </div>

          <p style="font-size: 14px; color: #555;">Keep learning and growing! 🚀</p>
          <br>
          <p style="font-size: 14px; color: #555;">Best regards,</p>
          <p style="font-weight: bold; font-size: 16px; color: #4CAF50;">NexTurn Team</p>

          <footer style="margin-top: 20px; padding-top: 10px; text-align: center; border-top: 2px solid #ddd;">
              <p style="font-size: 12px; color: #666;">&copy; NexTurn | <a href="https://nexturn.com" target="_blank" style="color: #FF5722; text-decoration: none;">Visit Us</a></p>
          </footer>
      </div>
    `;
  } else {
    // Normal Score Email
    emailHTML = `
      <div style="font-family: 'Arial', sans-serif; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); max-width: 500px; background: linear-gradient(135deg, #ffffff, #f9f9f9);">
      <h2 style="color: #ffffff; background: #4CAF50; padding: 12px; text-align: center; border-radius: 8px;">🎉 Quiz Results 🎉</h2>
      
      <p style="font-size: 16px; color: #333;">Hi <strong style="color: #FF5722;">${userName}</strong>,</p>
      <p style="font-size: 14px; color: #555;">Great job on completing the quiz! Here are your results:</p>
      
      <div style="background: #E3F2FD; padding: 12px; border-radius: 8px; text-align: center; margin: 10px 0;">
          <h3 style="color: #1565C0; margin: 0;">✅ Score: 
              <span style="color: #4CAF50; font-size: 22px;">${score}/${totalQuestions} (${percentage.toFixed(2)}%)</span>
          </h3>
      </div>

      <p style="font-size: 14px; color: #333;">Keep practicing and improving! 🚀</p>
      
      <br>
      <p style="font-size: 14px; color: #555;">Best regards,</p>
      <p style="font-weight: bold; font-size: 16px; color: #4CAF50;">NexTurn Team</p>

      <footer style="margin-top: 20px; border-top: 2px solid #ddd; padding-top: 10px; text-align: center; background: #f1f1f1; border-radius: 8px;">
          <p style="font-size: 12px; color: #666;">&copy; NexTurn | <a href="https://nexturn.com" target="_blank" style="color: #FF5722; text-decoration: none; font-weight: bold;">Visit Us</a></p>
      </footer>
      </div>
    `;
  }

  const mailOptions = {
    from: `"NexTurn Team" <arksvgnss@gmail.com>`,
    to: userEmail,
    subject: percentage > 50 ? '🎖 Your Certificate of Achievement' : 'Your Quiz Score 🎯',
    html: emailHTML,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Score email sent to ${userEmail}`);
    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
