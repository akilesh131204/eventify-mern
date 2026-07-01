const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. General, VIP
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    sold: { type: Number, default: 0 },
    description: { type: String, default: '' },
  },
  { _id: true }
);

const sessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    speaker: { type: String, default: '' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    description: { type: String, default: '' },
  },
  { _id: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    category: {
      type: String,
      enum: ['Music', 'Technology', 'Business', 'Sports', 'Arts', 'Education', 'Food', 'Health', 'Other'],
      default: 'Other',
    },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: [true, 'Event date is required'] },
    endDate: { type: Date },
    time: { type: String, required: true },
    location: {
      venue: { type: String, required: true },
      address: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
      isOnline: { type: Boolean, default: false },
      onlineLink: { type: String, default: '' },
    },
    coverImage: { type: String, default: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200' },
    gallery: [{ type: String }],
    videoUrl: { type: String, default: '' },
    ticketTypes: [ticketTypeSchema],
    sessions: [sessionSchema],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    tags: [{ type: String }],
    capacity: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ date: 1 });
eventSchema.index({ 'location.city': 1 });
eventSchema.index({ category: 1 });

eventSchema.virtual('minPrice').get(function () {
  if (!this.ticketTypes || this.ticketTypes.length === 0) return 0;
  return Math.min(...this.ticketTypes.map((t) => t.price));
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
