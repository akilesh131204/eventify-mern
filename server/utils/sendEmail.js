const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email send failed:', error.message);
    return false;
  }
};

const ticketConfirmationTemplate = (registration, event) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color:#4f46e5;">🎟️ Your Ticket is Confirmed!</h2>
    <p>Hi ${registration.attendeeDetails.name},</p>
    <p>Thank you for registering for <strong>${event.title}</strong>.</p>
    <table style="width:100%; border-collapse: collapse; margin-top: 16px;">
      <tr><td style="padding:8px; border:1px solid #eee;">Ticket Code</td><td style="padding:8px; border:1px solid #eee;"><strong>${registration.ticketCode}</strong></td></tr>
      <tr><td style="padding:8px; border:1px solid #eee;">Ticket Type</td><td style="padding:8px; border:1px solid #eee;">${registration.ticketTypeName}</td></tr>
      <tr><td style="padding:8px; border:1px solid #eee;">Quantity</td><td style="padding:8px; border:1px solid #eee;">${registration.quantity}</td></tr>
      <tr><td style="padding:8px; border:1px solid #eee;">Amount Paid</td><td style="padding:8px; border:1px solid #eee;">₹${registration.totalAmount}</td></tr>
      <tr><td style="padding:8px; border:1px solid #eee;">Date</td><td style="padding:8px; border:1px solid #eee;">${new Date(event.date).toDateString()}</td></tr>
      <tr><td style="padding:8px; border:1px solid #eee;">Venue</td><td style="padding:8px; border:1px solid #eee;">${event.location.venue}, ${event.location.city}</td></tr>
    </table>
    <p style="margin-top:16px;">Please keep this ticket code handy for entry. See you there!</p>
  </div>
`;

module.exports = { sendEmail, ticketConfirmationTemplate };
