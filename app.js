const express = require('express'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  bodyParser = require('body-parser'),
  localStrategy = require('passport-local'),
  passportLocalMongoose = require('passport-local-mongoose'),
  User = require('./models/user');

mongoose
  .connect('mongodb://206.189.170.211/auth')
  .then(() => console.log('Connection Succeeded'))
  .catch(console.error);

const app = express();
app.set('view engine', 'ejs');
app.use(
  require('express-session')({
    secret: 'this is a dope secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
  const body = req.body;
  User.register(new User({ username: body.username }), body.password, (err, user) => {
    if (err) {
      console.error(err);
      return res.render('register');
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/secret');
      });
    }
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
  (req, res) => {}
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

app.listen(3000, 'localhost', () => {
  console.log('Server Started');
});
