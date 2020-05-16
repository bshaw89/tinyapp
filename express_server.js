const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
const helpers = require('./helpers.js');
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');

const urlDatabase = {
  // "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "" }
  // "9sm5xK": { longURL: "http://www.google.com", userID: "" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// ****************************
//  AUTHENTICATE USER FUNCTION
// ****************************

const authenticateUser = (email, password) => {
  const user = helpers.getUserByEmail(email, users);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  } else {
    return false;
  }
};

// ****************************
//   URLS FOR USER FUNCTION
// ****************************

const urlsForUser = (id) => {
  let filteredDatabase = {};
  for (let url in urlDatabase) {
    // FOR CUSTOM USER INDEX PAGE
    if (id === urlDatabase[url].userID) {
      filteredDatabase[url] = urlDatabase[url];
    }
  }
  return filteredDatabase;
};

// *********************************
//  GENERATE RANDOM STRING FUNCTION
// *********************************

const generateRandomString = () => {
  let randomString = '';
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  for (let i = 0; i <= 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return randomString;
};

// *******************
// *     ROUTES      *
// *******************

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/register', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  for (let user in users) {
    if (users[user].email === req.body.email) {
      res.status(403).send('Email address already registered. Please login.');
    }
  }
  
  const userID = generateRandomString();
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Please enter email and password.");
  }

  for (let user in users) {
    if (users[user].email === req.body.email) {
      return res.status(400).end();
    }
  } // adds new user object to users
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userID] = { id: userID, email: req.body.email, password: hashedPassword };
  req.session.user_id = userID;
  res.redirect('/urls');

});

app.get('/login', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = authenticateUser(email, password);

  if (user) {
    req.session.user_id = user.id;
    res.redirect('/urls');
  } else {
    res.status(403).send('Wrong email or password.');
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get('/urls', (req, res) => {
  if (users[req.session.user_id]) { // if (user logged in)
    let templateVars = {
      user: users[req.session.user_id],
      urls: urlsForUser(req.session.user_id)
    };
    return res.render('urls_index', templateVars);
  } else {
    res.status(403).send('Please login or register.');
  }
});

app.post('/urls', (req, res) => {
  // creates new shortURL
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: users[req.session.user_id].id };
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/new', (req, res) => {
  if (users[req.session.user_id]) {
    let templateVars = { user: users[req.session.user_id] };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (users[req.session.user_id]) {
    console.log("urlDatabase:", urlDatabase)
    console.log(req.params);
    console.log("Cookie:", req.session.user_id);
    
    
    let url = urlDatabase[req.params.shortURL];
    
    if (req.session.user_id === url.userID) {
      let templateVars = {
        user: users[req.session.user_id],
        shortURL: req.params.shortURL,
        longURL: url.longURL
      };
      return res.render("urls_show", templateVars);
    } else {
      return res.status(403).send('You do not own that URL.');
    }
  } else {
    res.status(403).send('You must be logged in to edit or delete a URL.');
  }

});
app.post('/urls/:shortURL/delete', (req, res) => {
  if (users[req.session.user_id]) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect('/urls');
  } else {
    res.status(403).send('You must be logged in to delete a URL.');
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    return res.redirect(longURL);
  } else {
    res.status(403).send('Oops! URL does not exist.');
  }
});

app.post("/urls/:id", (req, res) => {
  if (users[req.session.user_id]) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.status(403).send('You must be logged in to edit a URL.');
  }
});

// ********************
// * SERVER LISTENING *
// ********************
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});