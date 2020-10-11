var express = require('express');
var bcrypt = require('bcrypt-nodejs');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Order = require('../models/order');
var User = require('../models/users');
var Cart = require('../models/cart');

var formDefaultName;
var formDefaultEmail;
var formDefaultPassword;

var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, function (req, res) {
  var nameOfUser = '';
  User.findOne({ email: req.session.email })
    .then((doc) => {
      // console.log(doc);
      var userObject = doc.toObject();
      nameOfUser = userObject.name;
      res.render('user/profile', {
        user: req.session.email,
        nameOfUser: nameOfUser,
        title: 'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
        description:
          'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
        keywords:
          'Drugs, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
      });
    })
    .catch((err) => console.log(err));
});

router.get('/orders', (req, res) => {
  Order.find({ user: req.user }, function (err, orders) {
    if (err) {
      return res.write('Error');
    }
    res.render('user/orders', {
      orders: orders,
      title: 'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
      description:
        'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
      keywords:
        'Drugs, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
    });
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
    res.render('user/details', {
      email: email,
      address: address,
      phone: phone,
      name: name,
      title: 'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
      description:
        'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
      keywords:
        'Drugs, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
    });
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
    res.render('user/update-details', {
      address: address,
      phone: phone,
      email: email,
      name: name,
      csrfToken: req.csrfToken(),
      title: 'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
      description:
        'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
      keywords:
        'Drugs, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
    });
  });
});

router.post('/update-details', (req, res) => {
  req.checkBody('name', 'Invalid username').isAlpha().trim().escape();
  req.checkBody('email', 'Invalid email').isEmail().normalizeEmail();
  req
    .checkBody('address', 'Invalid delivery address')
    .isString()
    .trim()
    .escape();
  req.checkBody('phone', 'Invalid phone').isMobilePhone().trim().escape();

  var errors = req.validationErrors();
  if (errors) {
    var messages = [];
    errors.forEach((error) => {
      messages.push(error.msg);
    });
    req.flash('error_msg', messages);
    res.redirect('/user/update-details');
  } else {
    var name = req.body.name;
    var email = req.body.email;
    var address = req.body.address;
    var phone = req.body.phone;

    User.findOneAndUpdate(
      { email: email },
      { name: name, address: address, phone: phone },
      { new: true }
    )
      .then((doc) => console.log('Success'))
      .catch((err) => console.log(err));
    req.session.email = email;
    req.flash('success_msg', 'Details updated successfully');
    res.redirect('/user/details');
  }
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
    res.render('user/summary', {
      email: email,
      address: address,
      phone: phone,
      products: cart.generateArray(),
      totalPrice: cart.totalPrice,
      title: 'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
      description:
        'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
      keywords:
        'Drugs, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
    });
  });
});

router.get('/change-password', isLoggedIn, (req, res) => {
  res.render('user/change-password', {
    csrfToken: req.csrfToken(),
    title: 'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
    description:
      'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
    keywords:
      'Drugs, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
  });
});

router.post('/change-password', (req, res) => {
  var email = req.session.email;
  var currentPassword = req.body.currentpassword;
  var newPassword = req.body.newpassword;
  var confirmPassword = req.body.confirmpassword;
  req.checkBody('currentpassword', 'Invalid password').isLength({ min: 4 });
  req.checkBody('newpassword', 'Invalid password').isLength({ min: 4 });
  req.checkBody('confirmpassword', 'Invalid password').isLength({ min: 4 });
  var errors = req.validationErrors();

  if (errors) {
    req.flash('error_msg', 'Password must be up to 4 characters');
  }

  User.findOne({ email: email })
    .then((doc) => {
      var userObject = doc.toObject();
      if (bcrypt.compareSync(currentPassword, userObject.password)) {
        if (newPassword === confirmPassword) {
          var hashed = bcrypt.hashSync(
            newPassword,
            bcrypt.genSaltSync(5),
            null
          );
          User.findOneAndUpdate(
            { email: email },
            { password: hashed },
            { new: true }
          )
            .then((doc) => {
              console.log('Success');

              req.flash('success_msg', 'Password updated successfully');
              res.redirect('/user/change-password');
            })
            .catch((err) => console.log(err));
        } else {
          req.flash(
            'error_msg',
            'New password and confirmed password do not match.'
          );
          res.redirect('/user/change-password');
        }
      }
    })
    .catch((err) => console.log(err));
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

router.post('/signup', function (req, res, next) {
  formDefaultName = req.body.name;
  formDefaultEmail = req.body.email;
  formDefaultPassword = req.body.password;
  passport.authenticate('local.signup', function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/user/signup');
    }
    req.login(user, function (err) {
      if (err) {
        return next(err);
      }
      var signUpEmail = req.body.email;
      req.session.email = signUpEmail;
      res.redirect('/user/profile');
    });
  })(req, res, next);
});

router.get('/signup', function (req, res) {
  var messages = req.flash('error');
  var name = formDefaultName;
  var email = formDefaultEmail;
  var password = formDefaultPassword;
  res.render('user/signup', {
    csrfToken: req.csrfToken(),
    messages: messages,
    hasErrors: messages.length > 0,
    name,
    email,
    password,
    title: 'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
    description:
      'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
    keywords:
      'Drugs, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
  });
  formDefaultName = '';
  formDefaultEmail = '';
  formDefaultPassword = '';
});

router.get('/signin', function (req, res) {
  var messages = req.flash('error');
  var name = formDefaultName;
  var email = formDefaultEmail;
  var password = formDefaultPassword;
  res.render('user/signin', {
    csrfToken: req.csrfToken(),
    messages: messages,
    hasErrors: messages.length > 0,
    name,
    email,
    password,
    title: 'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
    description:
      'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
    keywords:
      'Drugs, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
  });
  formDefaultName = '';
  formDefaultEmail = '';
  formDefaultPassword = '';
});

router.post('/signin', function (req, res, next) {
  formDefaultEmail = req.body.email;
  formDefaultPassword = req.body.password;
  passport.authenticate('local.signin', function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/user/signin');
    }
    req.login(user, function (err) {
      if (err) {
        return next(err);
      }
      var signInEmail = req.body.email;
      req.session.email = signInEmail;
      res.redirect('/user/profile');
    });
  })(req, res, next);
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
