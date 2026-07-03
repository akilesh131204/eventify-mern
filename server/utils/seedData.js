// Run with: node utils/seedData.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');

const seedAll = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Create organizer user
  let organizer = await User.findOne({ email: 'organizer@eventify.com' });
  if (!organizer) {
    organizer = await User.create({
      name: 'Demo Organizer',
      email: 'organizer@eventify.com',
      password: 'Organizer@123',
      role: 'organizer',
      organizationName: 'Eventify Demo Org',
      phone: '9876543210',
    });
    console.log('Organizer created: organizer@eventify.com / Organizer@123');
  }

  // Create attendee user
  let attendee = await User.findOne({ email: 'attendee@eventify.com' });
  if (!attendee) {
    attendee = await User.create({
      name: 'Demo Attendee',
      email: 'attendee@eventify.com',
      password: 'Attendee@123',
      role: 'attendee',
      phone: '9876543211',
    });
    console.log('Attendee created: attendee@eventify.com / Attendee@123');
  }

  // Delete existing demo events
  await Event.deleteMany({ organizer: organizer._id });

  const events = [
    {
      title: 'TechSummit 2026 — Future of AI',
      description: 'Join the biggest technology summit of the year! TechSummit 2026 brings together industry leaders, innovators, and tech enthusiasts for 2 days of inspiring talks, hands-on workshops, and unparalleled networking. Topics include Artificial Intelligence, Machine Learning, Blockchain, Cloud Computing, and Cybersecurity.',
      category: 'Technology',
      organizer: organizer._id,
      date: new Date('2026-08-15'),
      time: '09:00',
      location: { venue: 'Chennai Trade Centre', address: 'Nandambakkam', city: 'Chennai', state: 'Tamil Nadu', country: 'India', isOnline: false },
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
      ticketTypes: [
        { name: 'General Admission', price: 499, quantity: 500, sold: 120 },
        { name: 'VIP Pass', price: 1499, quantity: 100, sold: 30 },
        { name: 'Workshop Bundle', price: 2999, quantity: 50, sold: 15 },
      ],
      sessions: [
        { title: 'Opening Keynote: AI in 2026', speaker: 'Dr. Rajesh Kumar', startTime: new Date('2026-08-15T09:00:00'), endTime: new Date('2026-08-15T10:00:00'), description: 'An inspiring look at the future of artificial intelligence' },
        { title: 'Machine Learning in Production', speaker: 'Priya Sharma', startTime: new Date('2026-08-15T10:30:00'), endTime: new Date('2026-08-15T11:30:00'), description: 'Best practices for deploying ML models at scale' },
      ],
      status: 'approved',
      tags: ['AI', 'technology', 'machine learning', 'summit'],
      isFeatured: true,
      views: 450,
    },
    {
      title: 'Startup Weekend Chennai 2026',
      description: 'Got a startup idea? Turn it into reality in 54 hours! Startup Weekend Chennai is an intensive entrepreneurship event where participants brainstorm ideas, form teams, and build startups from scratch under the mentorship of experienced entrepreneurs and investors.',
      category: 'Business',
      organizer: organizer._id,
      date: new Date('2026-08-22'),
      time: '18:00',
      location: { venue: 'IIT Madras Research Park', address: 'Kanagam Road, Taramani', city: 'Chennai', state: 'Tamil Nadu', country: 'India', isOnline: false },
      coverImage: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200',
      ticketTypes: [
        { name: 'Participant', price: 999, quantity: 150, sold: 87 },
        { name: 'Mentor/Investor', price: 0, quantity: 30, sold: 12 },
      ],
      sessions: [
        { title: 'Pitch Your Idea', speaker: 'Various Participants', startTime: new Date('2026-08-22T18:00:00'), endTime: new Date('2026-08-22T20:00:00'), description: 'Open pitching session — share your startup idea in 60 seconds' },
      ],
      status: 'approved',
      tags: ['startup', 'entrepreneurship', 'business', 'hackathon'],
      views: 320,
    },
    {
      title: 'Classical Music Night — Carnatic Fusion',
      description: 'Experience an enchanting evening of Carnatic classical music fused with contemporary sounds. Featuring renowned artists from across Tamil Nadu performing ragas, kritis, and fusion pieces that bridge tradition and modernity. A perfect evening for music lovers of all ages.',
      category: 'Music',
      organizer: organizer._id,
      date: new Date('2026-09-05'),
      time: '19:00',
      location: { venue: 'Music Academy Auditorium', address: 'TTK Road, Alwarpet', city: 'Chennai', state: 'Tamil Nadu', country: 'India', isOnline: false },
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200',
      ticketTypes: [
        { name: 'Standard', price: 299, quantity: 300, sold: 180 },
        { name: 'Premium (Front Row)', price: 799, quantity: 50, sold: 38 },
      ],
      status: 'approved',
      tags: ['music', 'carnatic', 'classical', 'fusion'],
      views: 280,
    },
    {
      title: 'Full Stack Web Dev Bootcamp',
      description: 'Intensive 2-day bootcamp covering the complete MERN stack — MongoDB, Express.js, React.js, and Node.js. Perfect for beginners and intermediate developers looking to upgrade their skills. Includes hands-on projects, code reviews, and career guidance.',
      category: 'Education',
      organizer: organizer._id,
      date: new Date('2026-09-12'),
      time: '09:00',
      location: { venue: 'Online', address: '', city: 'Online', state: '', country: 'India', isOnline: true, onlineLink: 'https://zoom.us/j/demo' },
      coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200',
      ticketTypes: [
        { name: 'Early Bird', price: 799, quantity: 50, sold: 35 },
        { name: 'Regular', price: 1299, quantity: 100, sold: 22 },
      ],
      status: 'approved',
      tags: ['MERN', 'web development', 'bootcamp', 'online'],
      views: 390,
    },
    {
      title: 'Chennai Marathon 2026',
      description: 'Join thousands of runners in the annual Chennai Marathon! Choose from 5K, 10K, 21K (Half Marathon), or 42K (Full Marathon) categories. All finishers receive medals. Chip timing, hydration stations, medical support, and post-race celebrations included.',
      category: 'Sports',
      organizer: organizer._id,
      date: new Date('2026-10-04'),
      time: '05:30',
      location: { venue: 'Marina Beach', address: 'Beach Road', city: 'Chennai', state: 'Tamil Nadu', country: 'India', isOnline: false },
      coverImage: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1200',
      ticketTypes: [
        { name: '5K Run', price: 299, quantity: 1000, sold: 456 },
        { name: '10K Run', price: 499, quantity: 500, sold: 289 },
        { name: 'Half Marathon (21K)', price: 799, quantity: 300, sold: 178 },
        { name: 'Full Marathon (42K)', price: 1299, quantity: 200, sold: 89 },
      ],
      status: 'approved',
      tags: ['marathon', 'running', 'sports', 'fitness'],
      isFeatured: true,
      views: 780,
    },
    {
      title: 'Food Festival — Tastes of India',
      description: 'A 3-day culinary extravaganza celebrating the diverse food culture of India! Over 100 food stalls featuring authentic cuisines from every state. Live cooking demonstrations by celebrity chefs, street food competitions, and cultural performances.',
      category: 'Food',
      organizer: organizer._id,
      date: new Date('2026-09-20'),
      time: '11:00',
      location: { venue: 'Express Avenue Mall Grounds', address: 'Whites Road, Royapettah', city: 'Chennai', state: 'Tamil Nadu', country: 'India', isOnline: false },
      coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200',
      ticketTypes: [
        { name: 'Day Pass', price: 199, quantity: 2000, sold: 890 },
        { name: '3-Day Festival Pass', price: 499, quantity: 500, sold: 234 },
      ],
      status: 'approved',
      tags: ['food', 'festival', 'cuisine', 'culture'],
      views: 560,
    },
  ];

  for (const eventData of events) {
    await Event.create(eventData);
  }

  console.log(`✅ ${events.length} sample events created successfully!`);
  console.log('\n=== TEST ACCOUNTS ===');
  console.log('Admin:     admin@eventify.com     / Admin@123');
  console.log('Organizer: organizer@eventify.com / Organizer@123');
  console.log('Attendee:  attendee@eventify.com  / Attendee@123');
  process.exit(0);
};

seedAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
