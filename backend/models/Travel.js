const mongoose = require('mongoose');

const travelSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  country: { type: String, required: true },
  city: { type: String },
  transport: { type: String },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  people: { type: Number, default: 1, min: 1 },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Travel', travelSchema);
