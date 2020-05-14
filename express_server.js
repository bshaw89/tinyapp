const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = { user: users[req.cookies.user_id] }
  res.render('urls_register', templateVars);
})

app.post('/register', (req, res) => {
  const userID = generateRandomString();
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).end();
  }

  for (let user in users) {
    if (users[user].email === req.body.email) {
      // console.log(user.email);
      res.status(400).end();
    }
  }

  users[userID] = { id: userID, email: req.body.email, password: req.body.password };
  // console.log(users);
  // console.log(req.body.email);
  res.cookie('user_id', userID);
  res.redirect('/urls');
})



const findUserByEmail = (email) => {
  // loop through the users object
  for (let user in users) {
    // compare the emails, if they match return the user obj
    if (users[user].email === email) {
      return users[user];
    }
  }

  // after the loop, return false
  return false;
};



const authenticateUser = (email, password) => {
  // retrieve the user with that email
  const user = findUserByEmail(email);

  // if we got a user back and the passwords match then return the userObj
  if (user && password === user.password) {
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
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  } else {
    // otherwise we send an error message
    res.status(403).send('Wrong email or password.');
  }
});

app.get('/login', (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] }
  res.render('urls_login', templateVars)
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

app.get('/urls', (req, res) => {
  let templateVars = { 
    user: users[req.cookies.user_id], 
    urls: urlDatabase 
  };
  // console.log(req.cookies)
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  console.log(req.cookies.user_id);
  // users[req.cookies.user_id];
  console.log(users);
  console.log(users[req.cookies.user_id])
  let templateVars = { user: users[req.cookies.user_id] }
  res.render('urls_new', templateVars);
});


app.post('/urls', (req, res) => {
  // console.log(req.body.longURL);
  // urlDatabase = req.body[longURL];
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
  console.log(urlDatabase);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})

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
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

