const dotenv = require('dotenv');
dotenv.config();
const serverless = require('serverless-http');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passUserToView = require('../../middleware/pass-user-to-view.js')
const isSignedIn = require('../../middleware/is-signed-in.js')

// Controllers
const authController = require('../../controllers/auth.js');
const listingsController = require('../../controllers/listings.js');
const usersController = require('../../controllers/users.js');

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"))
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    })
  })
);

app.use(passUserToView);

app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/users/profile');
  } else {
    res.render('index.ejs');
  }
});

app.use('/auth', authController);

app.use('/listings', isSignedIn, listingsController);

app.use('/users', isSignedIn, usersController)


// 404
app.get('*', (req, res) => {
  res.render('404.ejs')
})

module.exports.handler = serverless(app)
