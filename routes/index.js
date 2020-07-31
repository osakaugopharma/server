var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var Product = require('../models/product');
var Order = require('../models/order');
var User = require('../models/users');
const mongo = require('mongodb').MongoClient;
const url = 'mongodb+srv://oup_client:e02pq1vJD4gKBVMH@cluster0.jtray.mongodb.net/shop?retryWrites=true&w=majority';

router.get('/', function (req, res) {
  Product.find(function (err, docs) {
    var productChunks = [];
    var chunkSize = 5;
    productChunks.push(docs.slice(0, chunkSize));
    res.render('shop/index', { title: 'Osaka Ugo Pharmaceuticals Limited', products: productChunks });
  });
});

router.get('/add-to-cart/:id', function (req, res) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  Product.findById(productId, function (err, product) {
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    res.redirect('/');
  });
});

router.get('/reduce/:id', function (req, res) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.reduce(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/increment/:id', function (req, res) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.increment(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/add/:id', function (req, res) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.add(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/remove/:id', function (req, res) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/antimalaria', function (req, res) {
  Product.find(function (err, docs) {
    var product = docs.filter(antimalaria => antimalaria.tag == 'Antimalaria');
    var antiMalariaArr = [];
    var chunkSize = 4;
    for (var i = 0; i < product.length; i += chunkSize) {
      antiMalariaArr.push(product.slice(i, i + chunkSize));
    }
    res.render('shop/products/antimalaria', { products: antiMalariaArr });
  });
});

router.get('/multivitamins', function (req, res) {
  Product.find(function (err, docs) {
    var product = docs.filter(multivitamin => multivitamin.tag == 'Multivitamin');
    var multivitaminArr = [];
    var chunkSize = 4;
    for (var i = 0; i < product.length; i += chunkSize) {
      multivitaminArr.push(product.slice(i, i + chunkSize));
    }
    res.render('shop/products/multivitamins', { products: multivitaminArr });
  });
});

router.get('/equipments', function (req, res) {
  Product.find(function (err, docs) {
    var product = docs.filter(equipment => equipment.tag == 'Equipment');
    var equipmentArr = [];
    var chunkSize = 4;
    for (var i = 0; i < product.length; i += chunkSize) {
      equipmentArr.push(product.slice(i, i + chunkSize));
    }
    res.render('shop/products/equipments', { products: equipmentArr });
  });
});

router.get('/analgesics', function (req, res) {
  Product.find(function (err, docs) {
    var product = docs.filter(analgesic => analgesic.tag == 'Analgesic');
    var analgesicArr = [];
    var chunkSize = 3;
    for (var i = 0; i < product.length; i += chunkSize) {
      analgesicArr.push(product.slice(i, i + chunkSize));
    }
    res.render('shop/products/analgesics', { products: analgesicArr });
  });
});

router.get('/antibiotics', function (req, res) {
  res.render('shop/products/antibiotics');
});

router.get('/about', function (req, res) {
  res.render('shop/about');
});

router.get('/contact', function (req, res) {
  res.render('shop/contact');
});

router.get('/antihypertensives', function (req, res) {
  res.render('shop/products/antihypertensives');
});

router.get('/contraceptives', function (req, res) {
  res.render('shop/products/contraceptives');
});

router.get('/eyedrugs', function (req, res) {
  res.render('shop/products/eyedrugs');
});

router.get('/ulcerandgastro', function (req, res) {
  res.render('shop/products/ulcerandgastro');
});

router.get('/success', function (req, res) {
  res.render('shop/success');
  var cart = new Cart(req.session.cart);
  var order = new Order({
    user: req.user,
    cart: cart,
    email: req.user.email,
    paymentId: req.query.tx_ref,
  });
  order.save(function (err, result) {
    req.session.cart = null;
  });
});

router.get('/failure', function (req, res) {
  res.render('shop/failure');
});

router.post('/checkout', (req, res) => {
  let address = req.body.address;
  let phone = req.body.phone;
  const email = req.session.email;
  mongo.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, (err, client) => {
    if (err) {
      console.error(err)
      return;
    }
    const db = client.db('shop');
    const collection = db.collection('users');
    collection.updateOne({ email: email }, { $set: { address: address, phone: phone } });
  });
});

router.get('/shopping-cart', function (req, res) {
  if (!req.session.cart) {
    return res.render('shop/shopping-cart', { products: null });
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', { products: cart.generateArray(), totalPrice: cart.totalPrice });
});

router.get('/checkout', isLoggedIn, function (req, res) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/checkout', { total: cart.totalPrice, email: req.user.email });
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}
