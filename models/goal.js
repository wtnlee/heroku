const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const goalSchema = new Schema({
  category: {
    type: String,
    enum: ['GENERAL', 'WELLNESS', 'PHYSICAL', 'HOBBY', 'CREATIVE', 'DIET'],
    default: 'GENERAL',
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  weeklyFrequency: {
    type: Number,
    required: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  private: Boolean,
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  collaborators: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  checkIns: [
    {
      type: Schema.Types.ObjectId,
      ref: 'CheckIn'
    }
  ],
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  completed: {
    type:Boolean,
    default: false
  }
})

module.exports = mongoose.model('Goal', goalSchema);
