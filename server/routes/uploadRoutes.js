const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const { protect } = require('../middleware/authMiddleware');

router.get('/signature', protect, asyncHandler(async (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = 'eventify';

  const signatureString = `folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

  res.json({
    success: true,
    data: {
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
    },
  });
}));

module.exports = router;