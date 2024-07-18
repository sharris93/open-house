const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passUserToView = require('./middleware/pass-user-to-view.js')
const isSignedIn = require('./middleware/is-signed-in.js')
const path = require('path')

// Controllers
const authController = require('./controllers/auth.js');
const listingsController = require('./controllers/listings.js');
const usersController = require('./controllers/users.js');

const port = process.env.PORT ? process.env.PORT : '3000';

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')))
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

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
