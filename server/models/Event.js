// server/models/Event.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an event title'],
    trim: true // Remove leading/trailing whitespace
  },
  description: {
    type: String,
    required: [true, 'Please add an event description']
  },
  date: {
    type: Date,
    required: [true, 'Please add an event date']
  },
  image: { // Optional image URL (consider validation if needed)
    type: String,
    trim: true
  },
  location: { // Optional location field
    type: String,
    trim: true
  },
  registrationLink: { // Optional link
     type: String,
     trim: true
  }
  // Add other fields if needed
  // Example: Storing moments directly (less ideal for many/large images)
  // moments: [
  //   { type: String } // Array of image URLs
  // ]
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

module.exports = mongoose.model('Event', EventSchema);