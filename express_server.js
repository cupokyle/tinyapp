// Including Dependencies & Hard-coding PORT
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
let cookieParser = require('cookie-parser');
const {findUserByID, findUserByEmail, verifyLogin} = require('./helpers/registerHelpers');
const {generateRandomString, getUserURLS} = require('./helpers/urlHelpers');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// This allows the use of EJS
app.set("view engine", "ejs");

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

// Hard-coded starter data
// User Storage
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

//Route handler for the URLS page
app.get("/urls", (req, res) => {
  // if (!req.cookies.user_id){
  //   res.redirect('/urls')
  // }
  const thisUser = findUserByID(req.cookies.user_id, users);
  const userURLS = getUserURLS(urlDatabase, thisUser);
  const templateVars = { urls: userURLS , user: thisUser};
  res.render("urls_index", templateVars);
});

//Route handler for the Registration page
app.get("/register", (req, res) => {
  res.render("urls_register");
});

//Add endpoint to handle a POST to /register
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

// Login Endpoint
app.get("/login", (req, res) => {
  res.render("urls_login");
});

//Add endpoint to handle a POST to /login
app.post('/login', (req, res) => {
  const thisUser = verifyLogin(req.body.email, req.body.password, users);
  if (thisUser) {
    res.cookie('user_id', thisUser.id);
    res.redirect('/urls');
  } else {
    return res.status(403).send('You\'ve entered an incorrect email address or password. Try again.');
  }
});

//Add endpoint to handle a POST to /logout
app.post('/logout', (req, res) => {
  const thisUser = findUserByID(req.cookies.user_id, users);
  res.clearCookie('user_id', thisUser.id);
  res.redirect('/urls');
});

//Update URL in DB
app.post("/urls/:shortURL", (req, res) => {
//extract shorturl from params
  const thisURL = urlDatabase[req.params.shortURL];

  //extract new url value from the form => req.body
  const updatedURL = req.body.currentURL;

  //update the quote content for that id
  thisURL.longURL = updatedURL;

  res.redirect('/urls');
});

// POST route to handle form submission from user
// And redirect to new Short URL page
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies.user_id};
  res.redirect(`/urls/${shortURL}`);
});


//Add a POST route that removes a URL resource: POST /urls/:shortURL/delete
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls/');
});

//Redirect Short URLs
app.get("/u/:shortURL", (req, res) => {
  const thisURL = urlDatabase[req.params.shortURL];
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send('Sorry, can\'t find that page.');
  }
  res.redirect(thisURL.longURL);
});

// Route handler for New URL form
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


// Route handler that takes in a shortURL parameter
app.get("/urls/:shortURL", (req, res) => {
  const thisUser = findUserByID(req.cookies.user_id, users);
  let thisURL = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL: thisURL.longURL, user: thisUser};
  res.render("urls_show", templateVars);
});

// Set our Port to listen (via Express) with console message
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});


//The order of route definitions matters! The GET /urls/new route needs to be defined before the GET /urls/:id route. Routes defined earlier will take precedence, so if we place this route after the /urls/:id definition, any calls to /urls/new will be handled by app.get("/urls/:id", ...) because Express will think that new is a route parameter. A good rule of thumb to follow is that routes should be ordered from most specific to least specific.