const Goal = require('../../models/Goal')
const User = require('../../models/User')
const CheckIn = require('../../models/CheckIn');

// const {dateToString} = require('../../helpers/date')

const user = async userId => {
  try {
    const user = await User.findById(userId);
    return transformUser(user);
  } catch (err) {
    throw err;
  }
}

const users = async userIds => {
  try {
    const users = await User.find({_id: {$in: userIds}});
    return users.map(user => {
      return transformUser(user);
    });
  } catch (err) {
    throw err;
  }
}

// const friend = async friendId => {
//   try {
//     const friend = await User.findById(friendId);
//     return transformFriend(friend);
//   } catch (err) {
//     throw (err);
//   }
// }
//
// const friends = async friendIds => {
//   try {
//     const friends = await User.find({_id: {$in: friendIds}});
//     return friends.map(user => {
//       return transformFriend(user);
//     });
//   } catch (err) {
//     throw (err;)
//   }
// }
//
// const friendGoal = async goalId => {
//   try {
//     const goal = await Goal.findById(goalId);
//     return transformGoal(goal);
//   } catch (err) {
//     throw err;
//   }
// }

const goal = async goalId => {
  try {
    const goal = await Goal.findById(goalId);
    return transformGoal(goal);
  } catch (err) {
    throw err;
  }
}

const goals = async goalIds => {
  try {
    const goals = await Goal.find({_id: {$in: goalIds}});
    return goals.map(goal => {
      return transformGoal(goal)
    });
  } catch (err) {
    throw err;
  }
};

const checkIn = async checkInId => {
  try {
    const checkIn = await CheckIn.findById(checkInId);
    return transformCheckIn(checkIn);
  } catch (err) {
    throw err;
  }
}

const checkIns = async checkInIds => {
  try {
    const checkIns = await CheckIn.find({_id: {$in: checkInIds}});
    return checkIns.map(checkIn => {
      return transformCheckIn(checkIn)
    });
  } catch (err) {
    throw err;
  }
}

const transformUser = user => {
  return {
    ...user._doc,
    _id: user.id,
    friends: users.bind(this, user.friends),
    friendRequests: users.bind(this, user.friendRequests),
    pendingRequests: users.bind(this, user.pendingRequests),
    createdGoals: goals.bind(this, user.createdGoals),
    collaboratedGoals: goals.bind(this, user.collaboratedGoals),
    checkIns: checkIns.bind(this, user.checkIns)
  }
}

const transformGoal = goal => {
  return {
    ...goal._doc,
    _id: goal.id,
    dateCreated: (new Date(goal.dateCreated)).toISOString(),
    creator: user.bind(this, goal.creator),
    collaborators: users.bind(this, goal.collaborators),
    checkIns: checkIns.bind(this, goal.checkIns),
    likes: users.bind(this, goal.likes)
  }
}
//
// const transformUser = user => {
//   return {
//     ...user._doc,
//     _id: user.id,
//     friends: users.bind(this, user.friends),
//     createdGoals: goals.bind(this, user.createdGoals),
//     collaboratedGoals: goals.bind(this, user.collaboratedGoals),
//     checkIns: checkIns.bind(this, user.checkIns)
//   }
// }

const transformCheckIn = checkIn => {
  return {
    ...checkIn._doc,
    _id: checkIn.id,
    date: (new Date(checkIn.dateOfCheckIn)).toISOString(),
    goal: goal.bind(this, checkIn.checkInGoal),
    user: user.bind(this, checkIn.checkInUser)
  }
}

exports.transformGoal = transformGoal;
exports.transformUser = transformUser;
exports.transformCheckIn = transformCheckIn;
