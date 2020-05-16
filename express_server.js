const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
// const cookieParser = require('cookie-parser');
// app.use(cookieParser());
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
  // "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "" },
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

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/register', (req, res) => {
  const templateVars = { user: users[req.session.user_id] }
  res.render('urls_register', templateVars);
})

app.post('/register', (req, res) => {
  const userID = generateRandomString();
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).end();
  }

  for (let user in users) {
    if (users[user].email === req.body.email) {
      // console.log(user.email);
      return res.status(400).end();
    }
  }
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userID] = { id: userID, email: req.body.email, password: hashedPassword };
  console.log(users[userID].password);
  // console.log(users);
  // console.log(req.body.email);
  req.session.user_id = userID; 
  res.redirect('/urls'); // return
})


// ****************************
// FIND USER BY EMAIL FUNCTION
// ****************************

// refactor to use user database
// add database parameter
// chance for (let USER in USERS) to for (let user in DATABASE)

// const findUserByEmail = (email, users) => {
//   // loop through the users object
//   for (let user in users) {
//     // compare the emails, if they match return the user obj
//     if (users[user].email === email) {
//       return users[user];
//     }
//   }

//   // after the loop, return false
//   return false;
// };

// ****************************
// AUTHENTICATE USER FUNCTION
// ****************************

const authenticateUser = (email, password) => {
  // retrieve the user with that email
  const user = helpers.getUserByEmail(email, users);

  // if we got a user back and the passwords match then return the userObj
  if (user && bcrypt.compareSync(password, user.password)) {
    // user is authenticated
    return user;
  } else {
    // Otherwise return false
    return false;
  }
};



app.post('/login', (req, res) => {
  // get data from form
  const email = req.body.email;
  const password = req.body.password;

  // Authenticate user
  const user = authenticateUser(email, password);

  // if authenticated, set cookie with its user id and redirect
  if (user) {
    req.session.user_id = user.id;
    res.redirect('/urls');
  } else {
    // otherwise we send an error message
    res.status(403).send('Wrong email or password.');
  }
});

app.get('/login', (req, res) => {
  const templateVars = { user: users[req.session.user_id] }
  res.render('urls_login', templateVars)
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
})

// ****************************
// URLS FOR USER FUNCTION
// ****************************

const urlsForUser = (id) => {
  let filteredDatabase = {};
  for (let url in urlDatabase) {
    // FOR CUSTOM USER INDEX PAGE
    if (id === urlDatabase[url].userID) {
      filteredDatabase[url] = urlDatabase[url]
    }
  }
  return filteredDatabase;
}

app.get('/urls', (req, res) => {
  if (users[req.session.user_id]) {

    // let filteredDatabase = {};
    // for (let url in urlDatabase) {
    //   // FOR CUSTOM USER INDEX PAGE
    //   if (req.cookies.user_id === urlDatabase[url].userID) {
    //     filteredDatabase[url] = urlDatabase[url]
    //   }
    // }
    let templateVars = { 
      user: users[req.session.user_id], 
      urls: urlsForUser(req.session.user_id)
    };
    return res.render('urls_index', templateVars);
  } else {
    res.status(403).send('Please login or register.')
  }
});

app.get('/urls/new', (req, res) => {
  if (users[req.session.user_id]) {
    let templateVars = { user: users[req.session.user_id] }
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});


app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: users[req.session.user_id].id } ;
  // console.log("users[req.cookies.user_id]", users[req.cookies.user_id]);
  res.redirect(`/urls/${shortURL}`);
  // console.log(urlDatabase);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  // console.log(urlDatabase[req.params.shortURL])
  // console.log("urlDatabase[req.params.shortURL]", req.body);
  if (users[req.session.user_id]) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect('/urls');
  } else {
    res.status(403).send('You must be logged in to delete a URL.')
  }
})

// ****************************
// GENERATE RANDOM STRING FUNCTION
// ****************************

function generateRandomString() {
  // define variable holding a ton of characters
  // define a variable that defines a random number
  // return the random number as an index of the characters
  let randomString = '';
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  for (let i =0; i <=6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return randomString;
};

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  // console.log("urlDatabase =", urlDatabase)
  // console.log("urlDatabase[req.params.shortURL] =", urlDatabase[req.params.shortURL])
  
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  if ((users[req.session.user_id])) {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
  } else {
    res.status(403).send('You must be logged in to edit a URL.')
  }
})

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

