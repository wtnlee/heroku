const User = require('../../models/User');

const {transformUser} = require('./merge')
var mongoose = require('mongoose');

module.exports =  {
  // gets a user if only they are a friend
  getFriend: async(args, req) => {
    try {
      var friendId = mongoose.Types.ObjectId(args.friendId);
      const user = await User.findById(req.session.userid);

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.friends.includes(friendId)) {
        throw new Error('Not a friend yet');
      }

      const friend = await User.findById(friendId);

      if (!friend) {
        throw new Error('User not found');
      }

      return transformUser(friend);
    } catch (err) {
      throw err;
    }
  },
  // sends a friend request
  sendFriendRequest: async (args, req) => {
    try {
      if (req.session.userid == args.friendId) {
        throw new Error('Cannot add self as a friend');
      }

      var friendId = mongoose.Types.ObjectId(args.friendId);

      const user = await User.findById(req.session.userid);
      const friend = await User.findById(friendId);

      if (!user || !friend) {
        throw new Error('User not found');
      }

      if (user.friends.includes(friendId)) {
        throw new Error('User already friend');
      }

      user.pendingRequests.push(friend);
      await user.save();

      friend.friendRequests.push(user);
      await friend.save();

      return true;
    } catch (err) {
      throw err;
    }
  },
  updateFriendRequest: async (args, req) => {
    try {
      if (req.session.userid == args.friendId) {
        throw new Error('Cannot add self as a friend');
      }

      var friendId = mongoose.Types.ObjectId(args.friendId);

      const user = await User.findById(req.session.userid);
      const friend = await User.findById(friendId);

      if (!user || !friend) {
        throw new Error('Users not found');
      }

      if (user.friends.includes(friendId)) {
        throw new Error('User already friend, cannot accept or decline');
      }

      if (!user.friendRequests.includes(friendId)) {
        throw new Error('Friend request not found');
      }

      if (!friend.pendingRequests.includes(req.session.userid)) {
        throw new Error('Friend request not found');
      }

      const myIndex = user.friendRequests.indexOf(friendId);
      if (myIndex > -1) {
        user.friendRequests.splice(myIndex, 1);
      }

      const theirIndex = friend.pendingRequests.indexOf(req.session.userid);
      if (theirIndex > -1) {
        friend.pendingRequests.splice(theirIndex, 1);
      }

      if (args.accepted) {
        user.friends.push(friendId);
        friend.friends.push(req.session.userid);

        await user.save();
        await friend.save();
        return true;
      }

      await user.save();
      await friend.save();

      return false;
    } catch (err) {
      throw err;
    }
  },
  removeFriend: async(args, req) => {
    try {
      if (req.session.userid == args.friendId) {
        throw new Error('Cannot remove self as a friend');
      }

      var friendId = mongoose.Types.ObjectId(args.friendId);

      const user = await User.findById(req.session.userid);
      const friend = await User.findById(friendId);

      if (!user || !friend) {
        throw new Error('User not found');
      }

      if (!user.friends.includes(friendId)) {
        throw new Error('User is not friend');
      }

      const myIndex = user.friends.indexOf(friendId);

      if (myIndex > -1) {
        user.friends.splice(myIndex, 1);
      }

      await user.save();

      const friendIndex = friend.friends.indexOf(req.session.userid);

      if (friendIndex > -1) {
        friend.friends.splice(friendIndex, 1);
      }

      await friend.save();

      return true;
    } catch (err) {
      throw err;
    }
  }
}
