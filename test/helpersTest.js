const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const expressServer = require('../express_server.js')

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert(typeof user === "object", "uh oh, not an object in the database")
  });

  it('should return undefined if an email is not in the database', function() {
    const user = getUserByEmail("use@example.com", testUsers)
    const expectedOutput = undefined;
    assert(user.email === expectedOutput);
  });
});