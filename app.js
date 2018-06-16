const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const LocalStrategy = require('passport-local');
const dotenv = require('dotenv');
const User = require('./models/user');
const TwitterStrategy = require('passport-twitter');

dotenv.config({ silent: true });
function log(text) {
  process.stdout.write(`${text}\n`);
}
mongoose
  .connect('mongodb://206.189.170.211/auth')
  .then(() => log('Connection Succeeded'))
  .catch(log);

const port = process.env.PORT || 8080;
const app = express();
app.set('view engine', 'ejs');
app.use(
  require('express-session')({
    secret: 'this is a dope secret',
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  log(`SERVING ${req.method} REQUEST ON ${req.url}`);
  next();
});
passport.use(new LocalStrategy(User.authenticate()));
passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_KEY,
      consumerSecret: process.env.TWITTER_SECRET,
      callbackURL: 'http://206.189.170.211/auth/twitter/callback',
    },
    (token, tokenSecret, profile, cb) => {
      User.findOrCreate({ twitterId: profile.id }, (err, user) => cb(null, user));
    },
  ),
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    log('hi');
    return next();
  }
  return res.redirect('/');
}
//  ROUTES

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/secret', isLoggedIn, (req, res) => {
  res.render('secret');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { body } = req.body;
  User.register(new User({ username: body.username }), body.password, err => {
    if (err) {
      log(err);
      return res.render('register');
    }
    return passport.authenticate('local')(req, res, () => res.redirect('/secret'));
  });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/secret',
    failureRedirect: '/login',
  }),
  () => {},
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get(
  '/auth/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect: '/secret',
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect('/secret');
  },
);

app.listen(port, 'localhost', () => {
  log('Server Started');
});
