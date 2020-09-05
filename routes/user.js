var express = require('express');
var bcrypt = require('bcrypt-nodejs');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Order = require('../models/order');
var User = require('../models/users');
var Cart = require('../models/cart');

var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, function (req, res) {
  var nameOfUser = '';
  User.findOne({ email: req.session.email }).then(doc => {
    console.log(doc);
    var userObject = doc.toObject();
    nameOfUser = userObject.name;
    res.render('user/profile', { user: req.session.email, nameOfUser: nameOfUser });
  }).catch(err => console.log(err));
});

router.get('/orders', (req, res) => {
  Order.find({ user: req.user }, function (err, orders) {
    if (err) {
      return res.write('Error');
    }
    res.render('user/orders', { orders: orders });
  });
});

router.get('/details', (req, res) => {
  var address = '';
  var phone = '';
  var name = '';
  var email = req.session.email;
  User.findOne({ email: email }, function (err, user) {
    if (err) {
      console.log(err);
    }
    if (user) {
      var userObject = user.toObject();
      address = userObject.address;
      phone = userObject.phone;
      name = userObject.name;
    }
    res.render('user/details', { email: email, address: address, phone: phone, name: name });
  });
});

router.get('/update-details', (req, res) => {
  var address = '';
  var phone = '';
  var name = '';
  var email = req.session.email;
  User.findOne({ email: email }, function (err, user) {
    if (err) {
      console.log(err);
    }
    if (user) {
      var userObject = user.toObject();
      address = userObject.address;
      phone = userObject.phone;
      name = userObject.name;
    }
    res.render('user/update-details', { address: address, phone: phone, email: email, name: name, csrfToken: req.csrfToken() });
  });
});

router.post('/update-details', (req, res) => {
  var email = req.body.email;
  var address = req.body.address;
  var phone = req.body.phone;
  const dbName = 'shop';
  User.findOneAndUpdate({ email: email }, { address: address, phone: phone }, { new: true })
    .then(doc => console.log(doc))
    .catch(err => console.log(err));
  req.session.email = email;
  res.render('user/details', { email, address, phone });
});

router.get('/summary', isLoggedIn, (req, res) => {
  var address = '';
  var phone = '';
  var cart = new Cart(req.session.cart);
  var email = req.session.email;
  User.findOne({ email: email }, (err, user) => {
    if (err) console.log(err);
    if (user) {
      var userObject = user.toObject();
      address = userObject.address;
      phone = userObject.phone;
    }
    res.render('user/summary', { email: email, address: address, phone: phone, products: cart.generateArray(), totalPrice: cart.totalPrice });
  });
});

router.get('/change-password', isLoggedIn, (req, res) => {
  res.render('user/change-password', { csrfToken: req.csrfToken() });
});

router.post('/change-password', (req, res) => {
  var email = req.session.email;
  var currentPassword = req.body.currentpassword;
  var newPassword = req.body.newpassword;
  var confirmPassword = req.body.confirmpassword;
  User.findOne({ email: email })
    .then(doc => {
      var userObject = doc.toObject();
      if (bcrypt.compareSync(currentPassword, userObject.password)) {
        if (newPassword === confirmPassword) {
          var hashed = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(5), null);
          User.findOneAndUpdate({ email: email }, { password: hashed }, { new: true }).then(doc => {
            console.log(doc);
          }).catch(err => console.log(err));
        }
      }
    })
    .catch(err => console.log(err));
  res.redirect('/user/profile');
});

router.get('/logout', isLoggedIn, function (req, res, next) {
  req.session.email = null;
  req.session.cart = null;
  req.logout();
  res.redirect('/');
});

router.use('/', notLoggedIn, function (req, res, next) {
  next();
});

router.post('/signup',
  passport.authenticate('local.signup', {
    failureRedirect: '/user/signup',
    failureFlash: true
  }), function (req, res, next) {
    if (req.session.oldUrl) {
      var oldUrl = req.session.oldUrl;
      req.session.oldUrl = null;
      res.redirect(oldUrl);
    } else {
      var email = req.body.email;
      req.session.email = email;
      res.redirect('/user/profile');
    }
  });

router.get('/signup', function (req, res) {
  var messages = req.flash('error');
  res.render('user/signup', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.get('/signin', function (req, res) {
  var messages = req.flash('error');
  res.render('user/signin', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signin', passport.authenticate('local.signin', {
  failureRedirect: '/user/signin',
  failureFlash: true
}), function (req, res, next) {

  if (req.session.oldUrl) {
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    var email = req.body.email;
    req.session.email = email;
    res.redirect('/user/profile');
  }
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}