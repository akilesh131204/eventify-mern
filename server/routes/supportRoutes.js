const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { sendEmail } = require('../utils/sendEmail');

// @desc    Submit support inquiry
// @route   POST /api/support
// @access  Public
router.post('/', asyncHandler(async (req, res) => {
  const { name, email, subject, category, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('All fields are required');
  }

  // Send email to admin
  await sendEmail({
    to: 'akilesh.131204@gmail.com',
    subject: `[Support] ${category?.toUpperCase()}: ${subject}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
        <div style="background:#4f46e5;padding:20px;border-radius:12px 12px 0 0;">
          <h2 style="color:white;margin:0;">📩 New Support Request</h2>
        </div>
        <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#64748b;width:30%;">Name</td><td style="padding:8px 0;font-weight:600;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Email</td><td style="padding:8px 0;font-weight:600;">${email}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Category</td><td style="padding:8px 0;font-weight:600;text-transform:capitalize;">${category}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Subject</td><td style="padding:8px 0;font-weight:600;">${subject}</td></tr>
          </table>
          <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-top:16px;">
            <p style="color:#374151;margin:0;white-space:pre-wrap;">${message}</p>
          </div>
        </div>
      </div>
    `,
  });

  // Send confirmation to user
  await sendEmail({
    to: email,
    subject: `Support Request Received - Eventify`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
        <div style="background:#4f46e5;padding:20px;border-radius:12px 12px 0 0;">
          <h2 style="color:white;margin:0;">✅ Support Request Received</h2>
        </div>
        <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;">
          <p>Hi ${name},</p>
          <p>Thank you for reaching out to Eventify support. We have received your request and will get back to you within <strong>24 hours</strong>.</p>
          <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="margin:0;color:#64748b;font-size:14px;"><strong>Subject:</strong> ${subject}</p>
            <p style="margin:8px 0 0;color:#64748b;font-size:14px;"><strong>Category:</strong> ${category}</p>
          </div>
          <p style="color:#64748b;font-size:14px;">If you need urgent help, email us at <a href="mailto:support@eventify.com" style="color:#4f46e5;">support@eventify.com</a></p>
        </div>
      </div>
    `,
  });

  res.json({ success: true, message: 'Support request submitted successfully' });
}));

module.exports = router;
