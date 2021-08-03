// Including Dependencies & Hard-coding PORT
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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

// Hard-coded starter data
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
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
  res.render("urls_new");
});


// Route handler that takes in a shortURL parameter
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// Set our Port to listen (via Express) with console message
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//The order of route definitions matters! The GET /urls/new route needs to be defined before the GET /urls/:id route. Routes defined earlier will take precedence, so if we place this route after the /urls/:id definition, any calls to /urls/new will be handled by app.get("/urls/:id", ...) because Express will think that new is a route parameter. A good rule of thumb to follow is that routes should be ordered from most specific to least specific.