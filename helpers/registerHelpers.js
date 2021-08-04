const findUserByID = function(userID, objDatabase) {
  for (const user in objDatabase) {
    if (objDatabase[user].id === userID) {
      return (objDatabase[user]);
    }
  }
};
const findUserByEmail = function(userEmail, objDatabase) {
  for (const user in objDatabase) {
    if (objDatabase[user].email === userEmail) {
      return (objDatabase[user]);
    }
  }
};
const verifyLogin = function(userEmail, userPassword, objDatabase) {
  for (const user in objDatabase) {
    if (objDatabase[user].email === userEmail) {
      if (objDatabase[user].password === userPassword) {
        return (objDatabase[user]);
      }
    }
  }
};

module.exports = {findUserByID, findUserByEmail, verifyLogin};
