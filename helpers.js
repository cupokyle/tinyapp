const bcrypt = require('bcrypt');

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
      if (bcrypt.compareSync(userPassword, objDatabase[user].password)) {
        return (objDatabase[user]);
      }
    }
  }
};

const generateRandomString = function() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  let solution = "";
  while (solution.length < 6) {
    let thisChar = chars[Math.round(Math.random() * 62)];
    if (thisChar !== undefined) {
      solution += thisChar;
    }
  }
  return solution;
};

const urlsForUser = function(db, user) {
  let myURLS = {};
  if (!user) {
    return myURLS;
  }
  for (const url in db) {
    if (db[url].userID === user.id) {
      myURLS[url] = db[url];
    }
  }
  return myURLS;
};

const findURLInDatabase = function(id, database) {
  for (let url in database) {
    if (url === id) {
      return url;
    }
  }
  return false;
};


module.exports = {findUserByID, findUserByEmail, verifyLogin, urlsForUser, findURLInDatabase, generateRandomString};
