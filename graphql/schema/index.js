const {buildSchema} = require('graphql');

module.exports = buildSchema(`
  type User {
    _id: ID!
    email: String!
    password: String
    name: String!
    imageURL: String
    friends: [User!]
    friendRequests: [User!]
    pendingRequests: [User!]
    createdGoals: [Goal!]
    collaboratedGoals: [Goal!]
    checkIns: [CheckIn!]
  }

  type Goal {
    _id: ID!
    category: String!
    title: String!
    description: String!
    weeklyFrequency: Int!
    dateCreated: String
    private: Boolean!
    creator: User!
    collaborators: [User!]
    checkIns: [CheckIn!]
    likes: [User!]
    completed: Boolean
  }

  type DashboardGoal {
    goal: Goal!
    shouldCheckIn: Boolean!
    checkIns: [String!]
    avgCollaboratorCheckIns: Int
  }

  type CheckIn {
    goal: Goal!
    user: User!
    date: String!
    points: Int!
  }

  type AuthData{
    userId: ID!
    token: String!
    tokenExpiration: Int!
  }

  input UserInput {
    email: String!
    password: String
    name: String!
  }

  input GoalInput {
    category: String
    title: String
    description: String
    weeklyFrequency: Int
    private: Boolean
    completed: Boolean
  }

  type Query {
    login(email:String!, password:String!): AuthData!
    me: User
    myDashboardCreatedGoals: [DashboardGoal!]
    myDashboardCollaboratedGoals: [DashboardGoal!]
    userByEmail(email:String!): User
    myExploreGeneralGoals: [Goal!]
    myExploreWellnessPhysicalGoals: [Goal!]
    myExploreHobbyCreativeGoals: [Goal!]
    getFriend(friendId: String!): User
  }

  type Mutation {
    createUser(userInput: UserInput): User
    createGoal(goalInput: GoalInput): Goal
    completeGoal(goalId: String!, completedGoal: Boolean): Goal
    collaborateOnGoal(goalId: String!): Goal
    goalCheckIn(goalId: String!): CheckIn
    likeGoal(goalId: String!): Goal
    sendFriendRequest(friendId: String!): Boolean
    updateFriendRequest(friendId: String!, accepted: Boolean): Boolean
    removeFriend (friendId: String!): Boolean
  }
`);
