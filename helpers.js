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

module.exports = { getUserByEmail };