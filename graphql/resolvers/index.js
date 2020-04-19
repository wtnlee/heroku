const authResolver = require('./auth');
const goalsResolver = require('./goals');
const usersResolver = require('./users');
const friendsResolver = require('./friends');

const rootResolver = {
  ...authResolver,
  ...goalsResolver,
  ...usersResolver,
  ...friendsResolver
}

module.exports = rootResolver;
