var express = require('express');
var nodemailer = require('nodemailer');
var router = express.Router();
var Cart = require('../models/cart');
var Product = require('../models/product');
var Order = require('../models/order');
const mongo = require('mongodb').MongoClient;
// const url = 'mongodb+srv://oup_client:e02pq1vJD4gKBVMH@cluster0.jtray.mongodb.net/shop?retryWrites=true&w=majority';
const url = 'mongodb://localhost:27017';
var request = require('request');

router.get('/', function (req, res) {
  Product.find(function (err, docs) {
    var productChunks = [];
    var chunkSize = 5;
    productChunks.push(docs.slice(0, chunkSize));

    var multiproduct = docs.filter(multivitamin => multivitamin.tag == 'Multivitamin');
    var multivitaminArr = [];
    var multiChunkSize = 5;
    for (var i = 0; i < multiproduct.length; i += multiChunkSize) {
      multivitaminArr.push(multiproduct.slice(i, i + multiChunkSize));
    }

    res.render('shop/index', { title: 'Osaka Ugo Pharmaceuticals Limited', products: productChunks, multivitaminsProducts: multivitaminArr });
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
    res.render('shop/products/antimalaria', { products: antiMalariaArr, noOfProducts: product.length });
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
    res.render('shop/products/multivitamins', { products: multivitaminArr, noOfProducts: product.length });
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
    res.render('shop/products/equipments', { products: equipmentArr, noOfProducts: product.length });
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

router.get('/product-details/:id', (req, res) => {
  var productId = req.params.id;
  Product.findById(productId, (err, product) => {
    if (err) {
      console.log(err);
    }
    console.log(product);
    res.render('shop/product-details/product-details', { product: [product] });
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

  orderStore.forEach(orderString => {
    orderStringTempLiteral = `Product name: ${orderString[0]}, Price: ${orderString[1]}, Quantity: ${orderString[2]} *** `;
    output += orderStringTempLiteral;
    orderStringTempLiteral = '';
  });



  var options = {
    'method': 'GET',
    'url': `https://api.flutterwave.com/v3/transactions/${req.query.transaction_id}/verify`,
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer FLWSECK_TEST-a0c7f66918bc15d9e7eb2a65146cbd79-X'
    }
  };

  request(options, (error, response) => {
    if (error) throw new Error(error);
    var response_object = JSON.parse(response.body);

    if (response_object.status === 'success' && response_object.data.currency === 'NGN' && response_object.data.amount >= amount) {
      var container = [];
      orderStore.forEach(string => {
        container.push(string[0]);
      });

      for (let i = 0; i < container.length; i++) {
        var noAfterPurchase;
        Product.findOne({ 'name': container[i] }, function (err, product) {
          if (err) {
            console.log(err);
          }
          if (product) {
            var no_in_stock = product.noOfProductInStock;
            noAfterPurchase = no_in_stock - 1;
          }
        });
        // const filter = { name: container[i] };
        // const update = { noOfProductInStock: noAfterPurchase }
        let doc = Product.findOneAndUpdate({ 'name': container[i] }, { 'noOfProductInStock': noAfterPurchase }, { new: true });
        console.log(doc.noOfProductInStock);

        // Product.findOne({ 'name': container[i] }, function (err, product) {
        //   if (err) {
        //       console.log(err);
        //   }
        //   if (product) {
        //       product.noOfProductInStock -= 1;
        //       // console.log(product);
        //   }
        // });
      }

      var order = new Order({
        user: req.user,
        cart: output,
        totalprice: cart.totalPrice,
        totalquantity: cart.totalQty,
        email: req.user.email,
        paymentId: req.query.tx_ref,
        orderDate: new Date(),
      });
      order.save(function (err, result) {
        if (err) {
          console.log(err);
        }
      });
    }
  });
  req.session.cart = null;
  res.render('shop/success');
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
  res.render('shop/checkout', { total: cart.totalPrice, email: req.user.email, signInEmail: req.session.email || null });
});

router.post('/contact-us', (req, res) => {
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
      host: "mail.osakaugopharma.com.ng",
      port: 465,
      secure: true,
      auth: {
        user: 'oup@osakaugopharma.com.ng',
        pass: '{C,$r7L1Jo[n',
      },
      tls: {
        rejectUnauthorized: false
      }
    });


    let info = await transporter.sendMail({
      from: '"Nodemailer Contact" <oup@osakaugopharma.com.ng>',
      to: "osakaugopharma@gmail.com",
      subject: "Node Contact Request",
      text: "Hello world?",
      html: output
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    res.render('shop/contact', { msg: 'Email has been sent' });
  }

  main().catch(console.error);

});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}
