const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/users');
let orderAddress;
let orderPhone;
const request = require('request');
let products;

Product.find()
  .then((docs) => (products = docs))
  .catch((err) => console.log(err));

router.get('/', function (req, res) {
  Product.find(function (err, docs) {
    var productChunks = [];
    var chunkSize = 5;
    productChunks.push(docs.slice(0, chunkSize));

    var multiproduct = docs.filter(
      (multivitamin) => multivitamin.tag == 'Multivitamin'
    );
    var multivitaminArr = [];
    var multiChunkSize = 5;
    for (var i = 0; i < multiproduct.length; i += multiChunkSize) {
      multivitaminArr.push(multiproduct.slice(i, i + multiChunkSize));
    }

    res.render('shop/index', {
      title:
        'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
      description:
        'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get cheap and affordable prices for medication, medical equipment, etc',
      keywords:
        'Drugs, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
      products: productChunks,
      multivitaminsProducts: multivitaminArr,
    });
  });
});

router.get('/search', (req, res) => {
  res.render('shop/search');
});

router.post('/search', (req, res) => {
  if (req.body.searchquery === '') {
    res.render('shop/search', {
      msg: 'No results found. Try a different search term.',
    });
  } else {
    let searchQuery = req.body.searchquery
      .toLowerCase()
      .replace(/\s/g, '')
      .replace(/-/g, '')
      .replace(/\//g, '')
      .replace(/'/, '')
      .replace(/drugs/g, '')
      .replace(/drug/g, '');

    let searchResults = products.filter((product) => {
      return (
        product.name
          .toLowerCase()
          .replace(/\s/g, '')
          .replace(/-/g, '')
          .replace(/\//g, '')
          .replace(/'/, '')
          .includes(searchQuery) ||
        product.tag
          .toLowerCase()
          .replace(/\s/g, '')
          .replace(/-/g, '')
          .replace(/\//g, '')
          .replace(/'/, '')
          .includes(searchQuery)
      );
    });
    if (searchResults.length <= 0) {
      res.render('shop/search', {
        msg: 'No results found. Try a different search term.',
      });
    } else {
      console.log(searchResults);
      res.render('shop/search', {
        searchResults: [searchResults],
      });
    }
  }
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
    res.redirect('/shopping-cart');
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
    var product = docs.filter(
      (antimalaria) => antimalaria.tag == 'Antimalaria'
    );
    var antiMalariaArr = [];
    var chunkSize = 4;
    for (var i = 0; i < product.length; i += chunkSize) {
      antiMalariaArr.push(product.slice(i, i + chunkSize));
    }
    res.render('shop/products/antimalaria', {
      title:
        'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
      description:
        'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get cheap and affordable prices for medication, medical equipment, etc',
      keywords:
        'Antimalaria drugs, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
      products: antiMalariaArr,
      noOfProducts: product.length,
    });
  });
});

router.get('/multivitamins', function (req, res) {
  Product.find(function (err, docs) {
    var product = docs.filter(
      (multivitamin) => multivitamin.tag == 'Multivitamin'
    );
    var multivitaminArr = [];
    var chunkSize = 4;
    for (var i = 0; i < product.length; i += chunkSize) {
      multivitaminArr.push(product.slice(i, i + chunkSize));
    }
    res.render('shop/products/multivitamins', {
      title:
        'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
      description:
        'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get cheap and affordable prices for medication, medical equipment, etc',
      keywords:
        'Multivitamins, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
      products: multivitaminArr,
      noOfProducts: product.length,
    });
  });
});

router.get('/equipments', function (req, res) {
  Product.find(function (err, docs) {
    var product = docs.filter((equipment) => equipment.tag == 'Equipment');
    var equipmentArr = [];
    var chunkSize = 4;
    for (var i = 0; i < product.length; i += chunkSize) {
      equipmentArr.push(product.slice(i, i + chunkSize));
    }
    res.render('shop/products/equipments', {
      title:
        'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
      description:
        'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
      keywords:
        'Medical equipments, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
      products: equipmentArr,
      noOfProducts: product.length,
    });
  });
});

router.get('/analgesics', function (req, res) {
  Product.find(function (err, docs) {
    var product = docs.filter((analgesic) => analgesic.tag == 'Analgesic');
    var analgesicArr = [];
    var chunkSize = 3;
    for (var i = 0; i < product.length; i += chunkSize) {
      analgesicArr.push(product.slice(i, i + chunkSize));
    }
    res.render('shop/products/analgesics', {
      products: analgesicArr,
      title:
        'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
      description:
        'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
      keywords:
        'Analgesics, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
    });
  });
});

router.get('/antibiotics', function (req, res) {
  res.render('shop/products/antibiotics', {
    title: 'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
    description:
      'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
    keywords:
      'Antibiotics, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
  });
});

router.get('/about', function (req, res) {
  res.render('shop/about', {
    title: 'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
    description:
      'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
    keywords:
      'Drugs, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
  });
});

router.get('/contact', function (req, res) {
  res.render('shop/contact', {
    title: 'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
    description:
      'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
    keywords:
      'contact us, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
  });
});

router.get('/antihypertensives', function (req, res) {
  res.render('shop/products/antihypertensives', {
    title: 'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
    description:
      'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
    keywords:
      'Hypertension drugs, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
  });
});

router.get('/contraceptives', function (req, res) {
  res.render('shop/products/contraceptives', {
    title: 'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
    description:
      'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
    keywords:
      'condoms, iud, pills, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
  });
});

router.get('/eyedrugs', function (req, res) {
  res.render('shop/products/eyedrugs', {
    title: 'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
    description:
      'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
    keywords:
      'eyedrops, eyedrugs, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
  });
});

router.get('/ulcerandgastro', function (req, res) {
  res.render('shop/products/ulcerandgastro', {
    title: 'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
    description:
      'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
    keywords:
      'stomach pain, antacids, ulcer, gastro, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
  });
});

router.get('/product-details/:id', (req, res) => {
  var productId = req.params.id;
  Product.findById(productId, (err, product) => {
    if (err) {
      console.log(err);
    }
    console.log(product);
    res.render('shop/product-details/product-details', {
      product: [product],
      title:
        'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
      description:
        'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
      keywords:
        'Drugs, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
    });
  });
});

router.get('/success', function (req, res) {
  var cart = new Cart(req.session.cart);
  var amount = cart.totalPrice;
  var cartOrderArr = [];
  var itemArr = [];
  var orderStore = [];
  var pusherValue = [];
  var itemQtyArr = [];
  var cartItems = cart.items;

  for (let value of Object.values(cartItems)) {
    itemQtyArr.push(value.qty);
  }

  let entries = Object.entries(cartItems);
  for (let [entry, value] of entries) {
    itemArr.push(value);
    cartOrderArr.push(itemArr);
    itemArr = [];
  }
  cartOrderArr.forEach((item, index) => {
    pusherValue.push(item[0].item.name);
    pusherValue.push(item[0].item.price);
    pusherValue.push(itemQtyArr[index]);
    orderStore.push(pusherValue);
    pusherValue = [];
  });

  var output = '';
  var orderStringTempLiteral = '';

  orderStore.forEach((orderString) => {
    orderStringTempLiteral = `Product name: ${orderString[0]}, Price: ${orderString[1]}, Quantity: ${orderString[2]} *** `;
    output += orderStringTempLiteral;
    orderStringTempLiteral = '';
  });

  var options = {
    method: 'GET',
    url: `https://api.flutterwave.com/v3/transactions/${req.query.transaction_id}/verify`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer FLWSECK_TEST-a0c7f66918bc15d9e7eb2a65146cbd79-X',
    },
  };

  request(options, (error, response) => {
    var email = req.session.email;
    if (error) throw new Error(error);
    var response_object = JSON.parse(response.body);

    if (
      response_object.status === 'success' &&
      response_object.data.currency === 'NGN' &&
      response_object.data.amount >= amount
    ) {
      var container = [];
      orderStore.forEach((string) => {
        container.push(string[0]);
      });
      for (let i = 0; i < container.length; i++) {
        Product.findOne({ name: container[i] })
          .then((doc) => {
            var productObject = doc.toObject();
            var productStockNumber = productObject.noOfProductInStock;
            var qtyBought;
            orderStore.forEach((orderString) => {
              qtyBought = orderString[2];
            });
            Product.findOneAndUpdate(
              { name: container[i] },
              { noOfProductInStock: productStockNumber - qtyBought },
              { new: true }
            )
              .then((doc) => {
                console.log('Success');
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
          });
      }

      User.findOne({ email: email })
        .then((doc) => {
          let userObject = doc.toObject();
          let orderName = userObject.name;

          var order = new Order({
            name: orderName,
            cart: output,
            totalprice: cart.totalPrice,
            totalquantity: cart.totalQty,
            email: email,
            paymentId: req.query.tx_ref,
            orderDate: new Date(),
            address: orderAddress,
            phone: orderPhone,
          });

          order.save(function (err, result) {
            if (err) {
              console.log(err);
            }
          });
        })
        .catch((err) => console.log(err));

      const orderAlert = `
      <h2>New Order Alert</h2>
      <p>You have a new order.</p>
      `;
      async function main() {
        let transporter = nodemailer.createTransport({
          host: 'mail.osakaugopharma.com.ng',
          port: 465,
          secure: true,
          auth: {
            user: 'oup@osakaugopharma.com.ng',
            pass: '{C,$r7L1Jo[n',
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
        let info = await transporter.sendMail({
          from: '"Nodemailer Contact" <oup@osakaugopharma.com.ng>',
          to: 'osakaugopharma@gmail.com',
          subject: 'New Order',
          text: 'Hello world?',
          html: orderAlert,
        });
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
      main().catch(console.error);
    }
  });
  req.session.cart = null;
  res.render('shop/success', {
    title: 'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
    description:
      'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
    keywords:
      'Drugs, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
  });
});

router.get('/failure', function (req, res) {
  res.render('shop/failure');
});

router.post('/checkout', (req, res) => {
  const email = req.session.email;
  var existingAddress;
  var existingPhone;

  User.findOne({ email: email })
    .then((doc) => {
      var userObject = doc.toObject();
      if (userObject.address && userObject.phone) {
        existingAddress = userObject.address;
        existingPhone = userObject.phone;
        orderAddress = existingAddress;
        orderPhone = existingPhone;
        res.redirect('/user/summary');
      } else {
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
          res.redirect('/checkout');
        } else {
          var address = req.body.address;
          var phone = req.body.phone;
          orderAddress = address;
          orderPhone = phone;
          // User.findOne({ email: email })
          // .then((doc) => {
          if (!doc.address && !doc.phone) {
            User.findOneAndUpdate(
              { email: email },
              { address: address, phone: phone },
              { new: true }
            )

              .then((doc) => {
                console.log(doc);
                res.redirect('/user/summary');
              })
              .catch((err) => {
                console.log(err);
              });
          }
          // })
          // .catch((err) => {
          //   console.log(err);
          // });
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/shopping-cart', function (req, res) {
  if (!req.session.cart) {
    return res.render('shop/shopping-cart', { products: null });
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
    totalQty: cart.totalQty,
    title: 'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
    description:
      'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
    keywords:
      'Drugs, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
  });
});

router.get('/checkout', isLoggedIn, function (req, res) {
  var userExists;
  var email = req.session.email;
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  User.findOne({ email: email }, function (err, user) {
    if (err) {
      console.log(err);
    }
    if (user) {
      var userObject = user.toObject();
      if (userObject.address) {
        userExists = true;
      }
      res.render('shop/checkout', {
        total: cart.totalPrice,
        exists: userExists,
        title:
          'Osaka Ugo Biopharmaceuticals: The No.1 Online Pharmacy in Nigeria',
        description:
          'Osaka Ugo Biopharmaceuticals Limited - The No.1 online pharmacy in Nigeria. Get affordable prices for medication, medical equipment, etc',
        keywords:
          'Drugs, online pharmacy, pharmacy, biopharmaceuticals, online medication, Nigeria, pharmacists, pharmaceutical stores',
      });
    }
  });
});

router.post('/contact-us', (req, res) => {
  req.checkBody('name').isString().trim().escape();
  req.checkBody('email', 'Invalid email address').isEmail().normalizeEmail();
  req.checkBody('message').isString().trim().escape();
  let errors = req.validationErrors();

  if (errors) {
    let messages = [];
    errors.forEach((error) => {
      messages.push(error.msg);
    });
    req.flash('error_msg', messages);
    res.redirect('/contact');
  } else {
    const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>
      <li>Name: ${req.body.name}</li>
      <li>Email: ${req.body.email}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;
    async function main() {
      let transporter = nodemailer.createTransport({
        host: 'mail.osakaugopharma.com.ng',
        port: 465,
        secure: true,
        auth: {
          user: 'oup@osakaugopharma.com.ng',
          pass: '{C,$r7L1Jo[n',
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      let info = await transporter.sendMail({
        from: '"Nodemailer Contact" <oup@osakaugopharma.com.ng>',
        to: 'osakaugopharma@gmail.com',
        subject: 'Node Contact Request',
        text: 'Hello world?',
        html: output,
      });
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      res.render('shop/contact', { msg: 'Email has been sent' });
    }
    main().catch(console.error);
  }
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}
