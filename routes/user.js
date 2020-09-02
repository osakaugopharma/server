var express = require('express');
var bcrypt = require('bcrypt-nodejs');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
// const MongoClient = require('mongodb').MongoClient;
// const assert = require('assert');
// const url = 'mongodb://localhost:27017';
var Order = require('../models/order');
var User = require('../models/users');
var Cart = require('../models/cart');

// const { session } = require('passport');
// var email;
var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, function (req, res) {
  res.render('user/profile', { user: req.session.email });
});

router.get('/orders', (req, res) => {
  Order.find({ user: req.user }, function (err, orders) {
    if (err) {
      return res.write('Error');
    }
    // var cart;
    // orders.forEach(function (order) {
    // cart = new Cart(order.cart);
    // cart = order.cart;
    // order.items = cart.generateArray();
    // });
    res.render('user/orders', { orders: orders });
  });
});

router.get('/details', (req, res) => {
  var address = '';
  var phone = '';
  var email = req.session.email;
  User.findOne({ email: email }, function (err, user) {
    if (err) {
      console.log(err);
    }

    if (user) {
      var userObject = user.toObject();
      address = userObject.address;
      phone = userObject.phone;
    }

    res.render('user/details', { email: email, address: address, phone: phone });
  });
});

router.get('/update-details', (req, res) => {
  var address = '';
  var phone = '';
  var email = req.session.email;
  User.findOne({ email: email }, function (err, user) {
    if (err) {
      console.log(err);
    }

    if (user) {
      var userObject = user.toObject();
      address = userObject.address;
      phone = userObject.phone;
    }

    res.render('user/update-details', { address: address, phone: phone, email: email, csrfToken: req.csrfToken() });
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

  // const updateDocument = function(db, callback) {
  //   const collection = db.collection('users');

  //   collection.updateOne({ email : email }
  //     , { $set: { email : email, address: address, phone: phone } }, function(err, result) {
  //     // assert.equal(err, null);
  //     // assert.equal(1, result.result.n);
  //     callback(result);
  //   });
  // }

  // MongoClient.connect(url, function(err, client) {
  //   // assert.equal(null, err);
  //   console.log("Connected successfully to server");
  //   const db = client.db(dbName);
  //   updateDocument(db, function() {
  //     // client.close();
  //     console.log('successful');
  //   });
  // });

  // mongo.connect(url, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true
  // }, (err, client) => {
  //   if (err) {
  //     console.error(err)
  //     return;
  //   }
  //   const db = client.db('shop');
  //   const collection = db.collection('users');
  //   collection.updateOne({ email: email }, { $set: {email: email, address: address, phone: phone} });
  // });

  // res.redirect('/user/details');
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
      console.log(userObject);
      
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