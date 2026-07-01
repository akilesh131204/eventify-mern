// Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: 'admin@eventify.com' });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }

  await User.create({
    name: 'Platform Admin',
    email: 'admin@eventify.com',
    password: 'Admin@123',
    role: 'admin',
  });

  console.log('Admin user created: admin@eventify.com / Admin@123');
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
