const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  organizingClub: { type: String, required: true },
  category: { type: String, required: true },
  seatLimit: { type: Number, default: 0 }, // 0 = unlimited
  priority: { type: String, enum: ['Urgent', 'Normal'], default: 'Normal' },
  creatorRole: { type: String, enum: ['clubpresident', 'lecturer', 'superadmin', 'student'], default: 'superadmin' },
  type: { type: String, enum: ['Event', 'Workshop'], default: 'Event' },
  posterImage: { type: String }, // Storing Base64 or URL
  status: { type: String, enum: ['Upcoming', 'History'], default: 'Upcoming' },
  startTime: { type: Date }, // Combined date/time for cron jobs
  endTime: { type: Date }, // To automatically move to history
  rsvpList: [{
    name: { type: String }, // Optional to allow legacy data
    studentId: { type: String, required: true },
    contactNumber: { type: String, required: true },
    rsvpTime: { type: Date, default: Date.now }
  }], // Storing student details
  attendanceList: [{
    studentId: { type: String, required: true },
    markedAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
