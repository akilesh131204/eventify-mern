const https = require('https');

const sendEmail = async ({ to, subject, html }) => {
  try {
    const data = JSON.stringify({
      sender: { name: 'Eventify', email: 'akilesh.131204@gmail.com' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(data),
      },
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('Email sent to:', to);
            resolve(true);
          } else {
            console.error('Brevo error:', body);
            resolve(false);
          }
        });
      });
      req.on('error', (e) => { console.error('Email error:', e.message); resolve(false); });
      req.write(data);
      req.end();
    });
  } catch (error) {
    console.error('Email failed:', error.message);
    return false;
  }
};

const ticketConfirmationTemplate = (registration, event) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f8fafc;padding:20px;">
    <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:30px;border-radius:16px 16px 0 0;text-align:center;">
      <h1 style="color:white;margin:0;font-size:28px;">🎟️ Eventify</h1>
      <p style="color:#c7d2fe;margin:8px 0 0;">Your ticket is confirmed!</p>
    </div>
    <div style="background:white;padding:30px;border-radius:0 0 16px 16px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
      <h2 style="color:#1e293b;">Hi ${registration.attendeeDetails.name}! 👋</h2>
      <p style="color:#64748b;">Thank you for registering for <strong style="color:#4f46e5;">${event.title}</strong>.</p>
      <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin:20px 0;">
        <h3 style="color:#1e293b;margin:0 0 16px;">Booking Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#64748b;width:40%;">Ticket Code</td><td style="padding:8px 0;font-weight:bold;color:#4f46e5;font-family:monospace;font-size:16px;">${registration.ticketCode}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Ticket Type</td><td style="padding:8px 0;font-weight:600;color:#1e293b;">${registration.ticketTypeName}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Quantity</td><td style="padding:8px 0;font-weight:600;color:#1e293b;">${registration.quantity}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Amount Paid</td><td style="padding:8px 0;font-weight:bold;color:#16a34a;font-size:18px;">₹${registration.totalAmount}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Date</td><td style="padding:8px 0;font-weight:600;color:#1e293b;">${new Date(event.date).toDateString()}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Venue</td><td style="padding:8px 0;font-weight:600;color:#1e293b;">${event.location.isOnline ? 'Online Event' : `${event.location.venue}, ${event.location.city}`}</td></tr>
        </table>
      </div>
      <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;border-radius:8px;margin:20px 0;">
        <p style="margin:0;color:#92400e;font-weight:600;">📌 Ticket Code: <span style="font-family:monospace;font-size:18px;color:#4f46e5;">${registration.ticketCode}</span></p>
      </div>
      <p style="color:#94a3b8;font-size:12px;margin-top:30px;text-align:center;">© 2026 Eventify. All rights reserved.</p>
    </div>
  </div>
`;

const scheduleUpdateTemplate = (registration, event) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
    <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:30px;border-radius:16px 16px 0 0;text-align:center;">
      <h1 style="color:white;margin:0;">📅 Schedule Updated</h1>
    </div>
    <div style="background:white;padding:30px;border-radius:0 0 16px 16px;">
      <p>Hi ${registration.attendeeDetails.name}, the schedule for <strong>${event.title}</strong> has been updated. Your ticket <strong style="color:#4f46e5;">${registration.ticketCode}</strong> remains valid.</p>
    </div>
  </div>
`;

module.exports = { sendEmail, ticketConfirmationTemplate, scheduleUpdateTemplate };
