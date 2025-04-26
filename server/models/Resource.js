// server/models/Resource.js
const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a resource title'],
    trim: true
  },
  link: {
    type: String,
    required: [true, 'Please add a resource link'],
    trim: true
    // Basic URL validation (consider a more robust regex or library if needed)
    // match: [ /^(http|https):\/\/[^ "]+$/, 'Please use a valid URL with HTTP or HTTPS']
  },
  description: {
    type: String,
    trim: true
  },
  category: { // Optional category for filtering
    type: String,
    trim: true
  },
  image: { // Optional image URL
    type: String,
    trim: true
  },
  // Optional: Add who submitted it?
  // submittedBy: {
  //    type: mongoose.Schema.ObjectId,
  //    ref: 'User'
  // }
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

module.exports = mongoose.model('Resource', ResourceSchema);