const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'materialmanagementservice@gmail.com', // Replace with your Gmail address
    pass: 'ruzg uown catz kcdp'   // Replace with your Gmail app password or actual password (less secure)
  }
});

const sendNotificationEmail = async (toEmail, subject, text) => {
  const mailOptions = {
    from: 'materialmanagementservice@gmail.com', // Sender address
    to: toEmail,
    subject: subject,
    text: text
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Notification email sent to ${toEmail}`);
  } catch (error) {
    console.error(`Error sending email to ${toEmail}:`, error);
  }
};

module.exports = { sendNotificationEmail };