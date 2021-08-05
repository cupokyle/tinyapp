//--------------SETTINGS---------------//

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const {findUserByID, findUserByEmail, verifyLogin} = require('./helpers/registerHelpers');
const {generateRandomString, urlsForUser} = require('./helpers/urlHelpers');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

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

const users = {  "aJ48lW": {
  id: "aJ48lW",
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

//--------------RATHER POINTLESS---------------//

// Registering a handler in the root path
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Displays urlDatabase as JSON
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// Pointless hello handler ¯\_(ツ)_/¯
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//------------INDEX ROUTES (/URLS)--------------//

//GET Route handler for the /URLS page
app.get("/urls", (req, res) => {
  const thisUser = findUserByID(req.cookies.user_id, users);
  const userURLS = urlsForUser(urlDatabase, thisUser);
  const templateVars = { urls: userURLS , user: thisUser, error: undefined};
  if (!thisUser) {
    templateVars['error'] = "You should like, log in or something.";
  }
  res.render("urls_index", templateVars);
});

// POST Route with Redirect for /URLS
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies.user_id};
  res.redirect(`/urls/${shortURL}`);
});

//------------LOGIN/LOGOUT ROUTES--------------//

//Login POST Endpoint
app.post('/login', (req, res) => {
  const thisUser = verifyLogin(req.body.email, req.body.password, users);
  if (thisUser) {
    res.cookie('user_id', thisUser.id);
    res.redirect('/urls');
  } else {
    return res.status(403).send('You\'ve entered an incorrect email address or password. Try again.');
  }
});
// Login GET ROUTE
app.get("/login", (req, res) => {
  res.render("urls_login");
});

//Logout POST Endpoint
app.post('/logout', (req, res) => {
  const thisUser = findUserByID(req.cookies.user_id, users);
  res.clearCookie('user_id', thisUser.id);
  res.redirect('/urls');
});

//------------REGISTER ROUTES--------------//

//Registration GET Route
app.get("/register", (req, res) => {
  res.render("urls_register");
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
    users[newUserID] = {
      id: newUserID,
      email: newUserEm,
      password: newUserPw
    };
    res.cookie('user_id', newUserID);
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
  let shortURL = req.params.shortURL;
  const urlOwnerID = urlDatabase[shortURL].userID;
  const myCookieID = req.cookies["user_id"];
  if (myCookieID === urlOwnerID) {
    delete urlDatabase[shortURL];
    res.redirect('/urls/');
  } else {
    return res.status(401).send('You can\'t do that! \n');
  }
});

//POST Route that makes update to myURLS
app.post("/urls/:shortURL", (req, res) => {
//extract shorturl from params
  const thisURL = urlDatabase[req.params.shortURL];
  const myCookieID = req.cookies["user_id"];
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
  const thisUser = findUserByID(req.cookies.user_id, users);
  const templateVars = {
    user: thisUser,
  };
  if (thisUser) {
    res.render("urls_new", templateVars);
  } else {
    res.render("urls_login");
  }
});

//------------/URLS/:shortURL Page Render--------------//

//GET Route that takes in shortURL and renders shortURL page.
app.get("/urls/:shortURL", (req, res) => {
  const thisUser = findUserByID(req.cookies.user_id, users);
  let thisURL = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL: thisURL.longURL, user: thisUser, error: undefined};
  if (!thisUser) {
    templateVars['error'] = "Please log in to your account to view this URL";
  }
  res.render("urls_show", templateVars);
});

// ------ PORT LISTENER ------ //

// Set our Port to listen (via Express)
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
