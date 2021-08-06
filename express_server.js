//--------------SETTINGS---------------//

const express = require("express");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const {findUserByID, findUserByEmail, verifyLogin, urlsForUser, findURLInDatabase, generateRandomString} = require('./helpers');

const PORT = 8080; // default port 8080

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

//------------- DUMMY DATA -------------------//
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

//-----------ACTUAL SERVER DATABASES----------//

// const urlDatabase = {};

// const users = {};

//------------INDEX ROUTES (/URLS)--------------//

// Displays urlDatabase as JSON
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//GET Route handler for the /URLS page
app.get("/urls", (req, res) => {
  const thisUser = findUserByID(req.session.user_id, users);
  const userURLS = urlsForUser(urlDatabase, thisUser);
  const templateVars = { urls: userURLS , user: thisUser, error: undefined};
  if (!thisUser) {
    templateVars['error'] = "You should like, log in or something.";
  }
  res.render("urls_index", templateVars);
});

// POST Route with Redirect for /URLS
app.post("/urls", (req, res) => {
  const thisUser = findUserByID(req.session.user_id, users);
  if (thisUser.id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id};
    res.redirect(`/urls/${shortURL}`);
  } else {
    return res.status(401).send('You are not authorized to access this database.');
  }
});

//------------LOGIN/LOGOUT ROUTES--------------//

//Login POST Endpoint
app.post('/login', (req, res) => {
  const thisUser = verifyLogin(req.body.email, req.body.password, users);
  if (thisUser) {
    req.session.user_id = thisUser.id;
    res.redirect('/urls');
  } else {
    return res.status(403).send('You\'ve entered an incorrect email address or password. Try again.');
  }
});
// Login GET ROUTE
app.get("/login", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  const templateVars = { user };
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  res.render("urls_login", templateVars);
});

//Logout POST Endpoint
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//------------REGISTER ROUTES--------------//

//Registration GET Route
app.get("/register", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  const templateVars = { user };
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  res.render("urls_register", templateVars);
});

//Registration POST Endpoint
app.post('/register', (req, res) => {
  const newUserID = generateRandomString();
  const newUserEm = req.body.email;
  const newUserPw = req.body.password;
  if (findUserByEmail(newUserEm, users)) {
    res.status(400).send('Provided email address is already registered to an account');
  } else if (!newUserEm || !newUserPw) {
    res.status(400).send('Please enter a valid email address and password');
  } else {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newUserPw, salt);
    users[newUserID] = {
      id: newUserID,
      email: newUserEm,
      password: hash
    };
    req.session.user_id = newUserID;
    res.redirect('/urls');
  }
});

//------------/URLS/:shortURL ROUTES--------------//

//GET Route that redirects shortURLs
app.get("/u/:shortURL", (req, res) => {
  const thisURL = urlDatabase[req.params.shortURL];
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send('Sorry, can\'t find that page.');
  }
  res.redirect(thisURL.longURL);
});

//POST Route that deletes a URL from myURLS
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    return res.status(401).send('You can\'t do that! \n');
  }
});

//GET Route that directs to edit page
app.get("/urls/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

//POST Route that makes update to myURLS
app.post("/urls/:shortURL", (req, res) => {
  const thisURL = urlDatabase[req.params.shortURL];
  const myCookieID = req.session["user_id"];
  if (myCookieID === thisURL.userID) {
    //extract new url value from the form => req.body
    const updatedURL = req.body.currentURL;
    //update the quote content for that id
    thisURL.longURL = updatedURL;
    res.redirect('/urls');
  } else {
    return res.status(401).send('You can\'t do that! \n');
  }
});
//------------/URLS/new ROUTE--------------//

//GET Route for New URL form
app.get("/urls/new", (req, res) => {
  const thisUser = findUserByID(req.session.user_id, users);
  const templateVars = {
    user: thisUser,
  };
  if (thisUser) {
    res.render("urls_new", templateVars);
  } else {
    res.render("urls_login", templateVars);
  }
});

//------------/URLS/:shortURL Page Render--------------//

//GET Route that takes in shortURL and renders shortURL page.
app.get("/urls/:shortURL", (req, res) => {
  const thisUser = findUserByID(req.session.user_id, users);
  let thisURL = urlDatabase[req.params.shortURL];
  let templateVars = {};
  if (!findURLInDatabase(req.params.shortURL, urlDatabase)) {
    templateVars['error'] = "The URL you've requested does not exist!";
    templateVars['user'] = null;
  } else {
    templateVars['shortURL'] = req.params.shortURL;
    templateVars['longURL'] = thisURL.longURL;
    templateVars['user'] = thisUser;
    templateVars['error'] = undefined;
    if (!thisUser || thisUser.id !== thisURL.userID) {
      templateVars['error'] = "Only the URL owner can access this URL";
    }
  }
  res.render("urls_show", templateVars);
});

//--------------ROOT / ---------------//

// Registering a handler in the root path
app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  res.redirect('/login');
});

// ------ PORT LISTENER ------ //

// Set our Port to listen (via Express)
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
