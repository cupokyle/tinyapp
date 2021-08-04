// Including Dependencies & Hard-coding PORT
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
let cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// This allows the use of EJS
app.set("view engine", "ejs");

// Generator to create random 6-char shortURLs

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

const findUserByID = function(userID, objDatabase) {
  for (const user in objDatabase) {
    if (objDatabase[user].id === userID) {
      return (objDatabase[user]);
    }
  }
};

// Hard-coded starter data
// URL Storage
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Hard-coded starter data
// User Storage
const users = {  "userRandomID": {
  id: "userRandomID",
  email: "user@example.com",
  password: "purple-monkey-dinosaur"
},
"user2RandomID": {
  id: "user2RandomID",
  email: "user2@example.com",
  password: "dishwasher-funk"
}};
findUserByID('user2RandomID', users);

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
  const thisUser = findUserByID(req.cookies.user_id, users);
  const templateVars = { urls: urlDatabase , user: thisUser};
  res.render("urls_index", templateVars);
});

//Route handler for the Registration page
app.get("/register", (req, res) => {
  const templateVars = {error: ""};
  res.render("urls_register", templateVars);
});

//Add endpoint to handle a POST to /register
app.post('/register', (req, res) => {
  const newUserID = generateRandomString();
  const newUserEm = req.body.email;
  const newUserPw = req.body.password;
  let templateVars = {error: ""};
  if (users[newUserEm]) {
    console.log("email already in use")
  } else if (newUserEm && newUserPw) {
    users[newUserID] = {
      id: newUserID,
      email: newUserEm,
      password: newUserPw
    };
    res.cookie('user_id', newUserID);
    res.redirect('/urls');
  } else {
    templateVars = {error: "Please enter a valid email address and password"};
    res.render("urls_register", templateVars);
  }
});

//Add endpoint to handle a POST to /login
app.post('/login', (req, res) => {
  const inputUsername = req.body.username;
  res.cookie('username', inputUsername);
  res.redirect('/urls');
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
  const oldURL = req.params.shortURL;
  //extract new url value from the form => req.body
  const currentURL = req.body.currentURL;
  //update the quote content for that id
  urlDatabase[oldURL] = currentURL;
  res.redirect('/urls');
});

// POST route to handle form submission from user
// And redirect to new Short URL page
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);     // Respond with 'Ok' (we will replace this)
});


//Add a POST route that removes a URL resource: POST /urls/:shortURL/delete
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls/');
});

//Redirect Short URLs
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send('Sorry, can\'t find that page.');
  }
  res.redirect(longURL);
});

// Route for New URL form
app.get("/urls/new", (req, res) => {
  const thisUser = findUserByID(req.cookies.user_id, users);
  const templateVars = {
    user: thisUser,
  };
  res.render("urls_new", templateVars);
});


// Route handler that takes in a shortURL parameter
app.get("/urls/:shortURL", (req, res) => {
  const thisUser = findUserByID(req.cookies.user_id, users);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: thisUser};
  res.render("urls_show", templateVars);
});

// Set our Port to listen (via Express) with console message
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//The order of route definitions matters! The GET /urls/new route needs to be defined before the GET /urls/:id route. Routes defined earlier will take precedence, so if we place this route after the /urls/:id definition, any calls to /urls/new will be handled by app.get("/urls/:id", ...) because Express will think that new is a route parameter. A good rule of thumb to follow is that routes should be ordered from most specific to least specific.