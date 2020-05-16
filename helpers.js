const expressServer = require('./express_server.js')
const bcrypt = require('bcrypt');

const getUserByEmail = (email, users) => {
  // loop through the users object
  for (let user in users) {
    // compare the emails, if they match return the user obj
    if (users[user].email === email) {
      return users[user];
    }
  }

  // after the loop, return false
  return false;
};

// const authenticateUser = (email, password) => {
//   // retrieve the user with that email
//   const user = getUserByEmail(email, expressServer.users);

//   // if we got a user back and the passwords match then return the userObj
//   if (user && bcrypt.compareSync(password, user.password)) {
//     // user is authenticated
//     return user;
//   } else {
//     // Otherwise return false
//     return false;
//   }
// };

// console.log(expressServer.users);

module.exports = { getUserByEmail }