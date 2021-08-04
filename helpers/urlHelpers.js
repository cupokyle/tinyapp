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

module.exports = {generateRandomString, urlsForUser};