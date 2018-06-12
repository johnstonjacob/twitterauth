const express = require('express'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  bodyParser = require('body-parser'),
  localStrategy = require('passport-local'),
  passportLocalMongoose = require('passport-local-mongoose'),
  dotenv = require('dotenv').config({ silent: true }),
  User = require('./models/user'),
  TwitterStrategy = require('passport-twitter');
mongoose
  .connect('mongodb://206.189.170.211/auth')
  .then(() => console.log('Connection Succeeded'))
  .catch(console.error);

const port = process.env.PORT || 8080;

const app = express();
app.set('view engine', 'ejs');
app.use(
  require('express-session')({
    secret: 'this is a dope secret',
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
app.use( (req, res, next) => {
	console.log(`SERVING ${req.method} REQUEST ON ${req.url}`);
	next();
})
passport.use(new localStrategy(User.authenticate()));
passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_KEY,
      consumerSecret: process.env.TWITTER_SECRET,
      callbackURL: 'http://206.189.170.211/auth/twitter/callback'
    },
    (token, tokenSecret, profile, cb) => {
      User.findOrCreate({ twitterId: profile.id }, (err, user) =>
        cb(err, user)
      );
    }
  )
);
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
  User.register(
    new User({ username: body.username }),
    body.password,
    (err, user) => {
      if (err) {
        console.error(err);
        return res.render('register');
      } else {
        passport.authenticate('local')(req, res, () => {
          res.redirect('/secret');
        });
      }
    }
  );
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/secret',
    failureRedirect: '/login'
  }),
  (req, res) => {}
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get(
  '/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  (req, res) => res.redirect('/secret')
);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

app.listen(port, 'localhost', () => {
  console.log('Server Started');
});
