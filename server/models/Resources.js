const mongoose = require('mongoose');
const ResourceSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  link:        { type: String, required: true },
  description: { type: String },
  image:       { type: String }
}, { timestamps: true });
module.exports = mongoose.model('Resource', ResourceSchema);
