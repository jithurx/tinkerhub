// server/models/Announcement.js
const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an announcement title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please add announcement content']
  },
  date: { // Represents the date the announcement is relevant for or was made
    type: Date,
    default: Date.now // Default to when it's created
  },
  image: { // Optional image URL
    type: String,
    trim: true
  },
  link: { // Optional link for more details
    type: String,
    trim: true
  },
  // Optional: Link to a specific event?
  // eventId: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: 'Event'
  // }
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

module.exports = mongoose.model('Announcement', AnnouncementSchema);