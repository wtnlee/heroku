const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  imageURL: String,
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  friendRequests: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  pendingRequests: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  createdGoals: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Goal'
    }
  ],
  collaboratedGoals: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Goal'
    }
  ],
  checkIns: [
    {
      type: Schema.Types.ObjectId,
      ref: 'CheckIn'
    }
  ]
})

module.exports = mongoose.model('User', userSchema)
