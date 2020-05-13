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

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/register', (req, res) => {
  let templateVars = { username: req.cookies["username"] }
  res.render('urls_register', templateVars);
})

app.post('/login', (req, res) => {
  res.cookie('username', req.body["username"]);
  res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})

app.get('/urls', (req, res) => {
  let templateVars = { 
    username: req.cookies["username"], 
    urls: urlDatabase 
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = { username: req.cookies["username"] }
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
  let templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

