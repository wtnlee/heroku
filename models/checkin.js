const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const checkInSchema = new Schema({
  checkInGoal: {
    type: Schema.Types.ObjectId,
    ref: 'Goal',
    required: true
  },
  checkInUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateOfCheckIn: {
    type: Date,
    default: Date.now
  },
  points: Number
});

module.exports = mongoose.model('CheckIn', checkInSchema);
