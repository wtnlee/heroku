const bcrypt = require('bcryptjs')
const jwt =  require('jsonwebtoken')
const User = require('../../models/User')
var myModule = require('../../app.js');
var mongoose = require('mongoose');

var users = myModule.userMap;

module.exports = {
  createUser: async args => {
    try {
      // console.log('got here')
      const existingUser = await User.findOne({
        email: args.userInput.email
      })
      if (existingUser) {
        throw new Error('User exists already');
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const newUser = new User({
        email: args.userInput.email,
        password: hashedPassword,
        name: args.userInput.name
      });

      const result = await newUser.save();
      // TODO: FIX GLOBAL USER ARRAY
      // users[args.userInput.email] = result._doc._id.toString();
      return {...result._doc, password: null, _id: result._doc._id.toString()};
    } catch (err) {
      throw err;
    }
  },
  login: async ({email, password}) => {
    const user = await User.findOne({email: email});
    if (!user) {
      throw new Error('User does not exist');
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error('Password is incorrect');
    }

    const token = jwt.sign({userId: user.id, email: user.email}, "goallaboratorsecretkey", {
      expiresIn: '1h'
    });

    return {
      userId: user.id, token: token, tokenExpiration: 1
    }
  }
}
