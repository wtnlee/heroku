const Goal = require('../../models/Goal');
const User = require('../../models/User');
const CheckIn = require('../../models/CheckIn');
var mongoose = require('mongoose');

const {transformGoal, transformCheckIn} = require('./merge')

module.exports = {
  createGoal: async (args, req) => {
    const goal = new Goal({
      category: args.goalInput.category.toUpperCase(),
      title: args.goalInput.title,
      description: args.goalInput.description,
      weeklyFrequency: +args.goalInput.weeklyFrequency,
      creator: req.session.userid,
      private: args.goalInput.private
    });

    let createdGoal;
    try {
      const result = await goal.save();
      createdGoal = transformGoal(result);

      // console.log(req.session.userid);
      const creator = await User.findById(req.session.userid);
      if (!creator) {
        throw new Error('User not found');
      }
      creator.createdGoals.push(goal);
      await creator.save();
      return createdGoal;
    } catch (err) {
      throw err;
    }
  },
  completeGoal: async (args, req) => {
    try {
      var goalId = mongoose.Types.ObjectId(args.goalId);
      const result = await Goal.findById(goalId);
      if (result.creater !== req.userId) {
        throw Error('User not authorized to complete goal');
      }

      result.completed = args.completedGoal;
      const savedGoal = await result.save();
      return transformGoal(savedGoal);
    } catch (err) {
      throw err;
    }
  },
  collaborateOnGoal: async (args, req) => {
    try {
      var goalId = mongoose.Types.ObjectId(args.goalId);
      const result = await Goal.findById(goalId);
      if (result.creater === req.session.userid) {
        throw Error('creator cant collaborate on goal');
      }

      if (result.private) {
        throw Error('cant collaborate on private goal');
      }

      const collaborator = await User.findById(req.session.userid);

      if (!collaborator) {
        throw Error('cant find collaborator');
      }

      result.collaborators.push(collaborator);
      await result.save();

      collaborator.collaboratedGoals.push(result);
      await collaborator.save();

      return transformGoal(result);
    } catch (err) {
      throw err;
    }
   },
  // getNewsFeed: async (args, req) => {
  //   try {
  //     const user = await User.findById(req.userId);
  //     const friendGoals = [];
  //     for (var friendId in user.friends) {
  //       const friend = await User.findById(args.friendId);
  //       for (var goalId in friend.createdGoals) {
  //         const goal = await Goal.findById(goalId);
  //         friendGoals.push(transformGoal(goal));
  //       }
  //       for (var goalId in friend.collaboratedGoals) {
  //         const goal = await Goal.findById(goalId);
  //         friendGoals.push(transformGoal(goal));
  //       }
  //     }
  //
  //     friendGoals.sort(function(a, b) {
  //       var d1 = new Date(a.dateCreated);
  //       var d2 = new Date(b.dateCreated);
  //       return d1 <= d2;
  //     });
  //
  //     return friendsGoals;
  //   } catch (err) {
  //     throw (err);
  //   }
  // },
  goalCheckIn: async (args, req) => {
    try {
      var goalId = mongoose.Types.ObjectId(args.goalId);
      const result = await Goal.findById(goalId);
      // console.log(req.session.userid);
      const collaborator = await User.findById(req.session.userid);

      if (!collaborator) {
        throw Error('cant find user');
      }

      var weightedPoints = 1;
      if (!result.private) {
        weightedPoints = 2;
      }

      const checkin = new CheckIn({
        points: weightedPoints
      });

      checkin.checkInGoal = goalId;
      checkin.checkInUser = req.session.userid;
      const savedCheckIn = await checkin.save();

      collaborator.checkIns.push(checkin);
      await collaborator.save();

      result.checkIns.push(checkin);
      await result.save();

      return transformCheckIn(savedCheckIn);
    } catch (err) {
      throw err;
    }
  },
  likeGoal: async (args, req) => {
    try {
      const collaborator = await User.findById(req.session.userid);
      if (!collaborator) {
        throw Error('cant find collaborator');
      }

      var goalId = mongoose.Types.ObjectId(args.goalId);
      const result = await Goal.findById(goalId);

      result.likes.push(collaborator);

      await result.save();

      return transformGoal(result);
    } catch (err) {
      throw err;
    }
  },
  myDashboardCreatedGoals: async (args, req) => {
      try {
        const user = await User.findById(req.session.userid);
        if (!user) {
          throw Error('cant find user');
        }

        var myDashBoardGoals = [];

        for (let i = 0; i < user.createdGoals.length; i++) {
          goalID = user.createdGoals[i];
          var thisObject = {}
          var thisGoal = await Goal.findById(goalID);

          var queryParams = {
            checkInUser: mongoose.Types.ObjectId(req.session.userid),
            checkInGoal: mongoose.Types.ObjectId(goalID)
          }

          var thisGoalCheckIns= [];
          var pastWeekCheckIns = [];

          await CheckIn.find(queryParams).then(checkIns => {
            for (let j = 0; j <checkIns.length; j++) {
                    // console.log(checkIns[j]);
                    thisGoalCheckIns.push(checkIns[j]);
                  }
          });

          var pastDate = new Date(Date.now() - 604800000);
          const today = new Date();
          var shouldCheckIn = true;

          for (let j = 0; j < thisGoalCheckIns.length; j++) {

            var checkIn = thisGoalCheckIns[j];
            var thisCheckInDate = new Date(checkIn.dateOfCheckIn);

            if (thisCheckInDate > pastDate) {
              pastWeekCheckIns.push(thisCheckInDate.toISOString());
            }

            shouldCheckIn = !(thisCheckInDate.getDate() === today.getDate() && thisCheckInDate.getMonth() === today.getMonth() && thisCheckInDate.getFullYear() === today.getFullYear());
          }

          thisObject.goal = transformGoal(thisGoal);
          thisObject.shouldCheckIn = shouldCheckIn;
          thisObject.checkIns = pastWeekCheckIns;
          myDashBoardGoals.push(thisObject);
        }

        myDashBoardGoals.sort(function(a,b) {
          if (a.goal.completed) {
            return -1;
          }
          if (a.shouldCheckIn) {
            return -1;
          }
          return 1;
        });

        return myDashBoardGoals;
      } catch (err) {
        throw err;
      }
  },
  myDashboardCollaboratedGoals: async (args, req) => {
    try {
      const user = await User.findById(req.session.userid);
      if (!user) {
        throw Error('cant find user');
      }

      var myDashBoardGoals = [];

      for (let i = 0; i < user.collaboratedGoals.length; i++) {
        goalID = user.collaboratedGoals[i];
        var thisObject = {}
        var thisGoal = await Goal.findById(goalID);

        var queryParams = {
          checkInUser: mongoose.Types.ObjectId(req.session.userid),
          checkInGoal: mongoose.Types.ObjectId(goalID)
        }

        var thisGoalCheckIns= [];
        var pastWeekCheckIns = [];

        await CheckIn.find(queryParams).then(checkIns => {
          for (let j = 0; j <checkIns.length; j++) {
            thisGoalCheckIns.push(checkIns[j]);
          }
        });

        var pastDate = new Date(Date.now() - 604800000);

        const today = new Date();

        var shouldCheckIn = true;

        for (let j = 0; j < thisGoalCheckIns.length; j++) {
          var checkIn = thisGoalCheckIns[j];
          var thisCheckInDate = new Date(checkIn.dateOfCheckIn);

          if (thisCheckInDate > pastDate) {
            pastWeekCheckIns.push(thisCheckInDate.toISOString());
          }

          shouldCheckIn = !(thisCheckInDate.getDate() === today.getDate() && thisCheckInDate.getMonth() === today.getMonth() && thisCheckInDate.getFullYear() === today.getFullYear());
        }

        thisObject.goal = transformGoal(thisGoal);
        thisObject.shouldCheckIn = shouldCheckIn;
        thisObject.checkIns = pastWeekCheckIns;
        myDashBoardGoals.push(thisObject);
      }

      myDashBoardGoals.sort(function(a,b) {
        if (a.goal.completed) {
          return -1;
        }
        if (a.shouldCheckIn) {
          return -1;
        }
        return 1;
      });

      return myDashBoardGoals;
    } catch (err) {
      throw err;
    }
  },
  myExploreGeneralGoals : async (args, req) => {
    try {
      const user = await User.findById(req.session.userid);
      if (!user) {
        throw Error('cant find user');
      }

      let allPublicGoals = [];

      var queryParams = {
        checkInUser: mongoose.Types.ObjectId(req.session.userid),
        checkInGoal: mongoose.Types.ObjectId(goalID)
      }

      for (let i = 0; i < user.friends.length; i++) {
        let friendId = user.friends[i];

        var queryParams = {
          category: "GENERAL",
          private: false,
          creator: mongoose.Types.ObjectId(friendId),
          completed: false
        }

        await Goal.find(queryParams).then(goals => {
          for (let j = 0; j < goals.length; j++) {
            let currentGoal = goals[j];
            currentGoal.dateCreated = (new Date(currentGoal.dateCreated)).toISOString;
            if (!currentGoal.collaborators.includes(req.session.userid)) {
              allPublicGoals.push(transformGoal(currentGoal));
            }
          }
        });
      }

      allPublicGoals.sort(function(a,b) {
        var aDate = new Date(a.dateCreated);
        var bDate = new Date(b.dateCreated);

        if (aDate > bDate) {
          return -1;
        }
        return 1;
      });

      return allPublicGoals;
    } catch (err) {
      throw err;
    }
  },
  myExploreWellnessPhysicalGoals : async (args, req) => {
    try {
      const user = await User.findById(req.session.userid);
      if (!user) {
        throw Error('cant find user');
      }

      let allPublicGoals = [];

      var queryParams = {
        checkInUser: mongoose.Types.ObjectId(req.session.userid),
        checkInGoal: mongoose.Types.ObjectId(goalID)
      }

      for (let i = 0; i < user.friends.length; i++) {
        let friendId = user.friends[i];

        var queryWellnessParam = {
          category: "WELLNESS",
          private: false,
          creator: mongoose.Types.ObjectId(friendId),
          completed: false
        }

        await Goal.find(queryWellnessParam).then(goals => {
          for (let j = 0; j < goals.length; j++) {
            let currentGoal = goals[j];
            currentGoal.dateCreated = (new Date(currentGoal.dateCreated)).toISOString;
            if (!currentGoal.collaborators.includes(req.session.userid)) {
              allPublicGoals.push(transformGoal(currentGoal));
            }
          }
        });

        var queryPhysicalParam = {
          category: "PHYSICAL",
          private: false,
          creator: mongoose.Types.ObjectId(friendId),
          completed: false
        }

        await Goal.find(queryPhysicalParam).then(goals => {
          for (let j = 0; j < goals.length; j++) {
            let currentGoal = goals[j];
            currentGoal.dateCreated = (new Date(currentGoal.dateCreated)).toISOString;
            if (!currentGoal.collaborators.includes(req.session.userid)) {
              allPublicGoals.push(transformGoal(currentGoal));
            }
          }
        });

        var queryDietParam = {
          category: "DIET",
          private: false,
          creator: mongoose.Types.ObjectId(friendId),
          completed: false
        }

        await Goal.find(queryDietParam).then(goals => {
          for (let j = 0; j < goals.length; j++) {
            let currentGoal = goals[j];
            currentGoal.dateCreated = (new Date(currentGoal.dateCreated)).toISOString;
            if (!currentGoal.collaborators.includes(req.session.userid)) {
              allPublicGoals.push(transformGoal(currentGoal));
            }
          }
        });
      }

      allPublicGoals.sort(function(a,b) {
        var aDate = new Date(a.dateCreated);
        var bDate = new Date(b.dateCreated);

        if (aDate > bDate) {
          return -1;
        }
        return 1;
      });

      return allPublicGoals;
    } catch (err) {
      throw err;
    }
  },
  myExploreHobbyCreativeGoals : async (args, req) => {
    try {
      const user = await User.findById(req.session.userid);
      if (!user) {
        throw Error('cant find user');
      }

      let allPublicGoals = [];

      var queryParams = {
        checkInUser: mongoose.Types.ObjectId(req.session.userid),
        checkInGoal: mongoose.Types.ObjectId(goalID)
      }

      for (let i = 0; i < user.friends.length; i++) {
        let friendId = user.friends[i];

        var queryHobbyParams = {
          category: "HOBBY",
          private: false,
          creator: mongoose.Types.ObjectId(friendId),
          completed: false
        }

        await Goal.find(queryHobbyParams).then(goals => {
          for (let j = 0; j < goals.length; j++) {
            let currentGoal = goals[j];
            currentGoal.dateCreated = (new Date(currentGoal.dateCreated)).toISOString;
            if (!currentGoal.collaborators.includes(req.session.userid)) {
              allPublicGoals.push(transformGoal(currentGoal));
            }
          }
        });

        var queryCreativeParams = {
          category: "CREATIVE",
          private: false,
          creator: mongoose.Types.ObjectId(friendId),
          completed: false
        }

        await Goal.find(queryCreativeParams).then(goals => {
          for (let j = 0; j < goals.length; j++) {
            let currentGoal = goals[j];
            currentGoal.dateCreated = (new Date(currentGoal.dateCreated)).toISOString;
            if (!currentGoal.collaborators.includes(req.session.userid)) {
              allPublicGoals.push(transformGoal(currentGoal));
            }
          }
        });
      }

      allPublicGoals.sort(function(a,b) {
        var aDate = new Date(a.dateCreated);
        var bDate = new Date(b.dateCreated);

        if (aDate > bDate) {
          return -1;
        }
        return 1;
      });

      return allPublicGoals;
    } catch (err) {
      throw err;
    }
  }
}

// explore page queries
