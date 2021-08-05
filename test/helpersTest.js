const { assert } = require('chai');

const {findUserByID, findUserByEmail, urlsForUser, findURLInDatabase, generateRandomString} = require('../helpers');

//--------------EXAMPLE DATA---------------//

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  AbbAAb: {
    longURL: "https://www.lego.com",
    userID: "johnny-test"
  }
};

const users = {    "userRandomID": {
  id: "userRandomID", 
  email: "user@example.com", 
  password: "purple-monkey-dinosaur"
},
"user2RandomID": {
  id: "user2RandomID", 
  email: "user2@example.com", 
  password: "dishwasher-funk"
},
"johnny-test": {
  id: "johnny-test",
  email: "123@123.com",
  password: "1"
}};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", users)
    const expectedOutput = users['userRandomID'];
    // Write your assert statement here
    assert.deepEqual(user, expectedOutput);
  });
  it('should return a undefined for invalid email', function() {
    const user = findUserByEmail("wealthhoarder@banks.com", users)
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);
  });
});


describe('findUserByID', function() {
  it('should return a user with valid ID', function() {
    const user = findUserByID("johnny-test", users)
    const expectedOutput = {
      id: "johnny-test",
      email: "123@123.com",
      password: "1"
    };
    assert.deepEqual(user, expectedOutput);
  });
  it('should return a undefined for invalid ID', function() {
    const user = findUserByID("wealthhoarder@banks.com", users)
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);
  });
});

describe('urlsForUser', function() {
  it('should return a urls object', function() {
    const urls = urlsForUser(urlDatabase, users["johnny-test"])
    const expectedOutput = { AbbAAb: { longURL: 'https://www.lego.com', userID: 'johnny-test' } };
    assert.deepEqual(urls, expectedOutput);
  });
  it('should return an empty object for user with no URLS', function() {
    const urls = urlsForUser(urlDatabase, users["User2RandomID"])
    const expectedOutput = {};
    assert.deepEqual(urls, expectedOutput);
  });
});

describe('findURLInDatabase', function() {
  it('should return id (truthy) if URL is in database', function() {
    const url = findURLInDatabase("b6UTxQ", urlDatabase);
    const expectedOutput = "b6UTxQ";
    assert.deepEqual(url, expectedOutput);
  });
  it('should return false for id not in database', function() {
    const url = findURLInDatabase(findURLInDatabase("ifr", urlDatabase))
    const expectedOutput = false;
    assert.deepEqual(url, expectedOutput);
  });
});

describe('generateRandomString', function() {
  it('should return 6 if length is 6', function() {
    const length = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(length, expectedOutput);
  });
});

// Cannot test verifyLogin effectively as it uses bcrypt.