var Product = require('../models/product');
const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/shop', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb+srv://oup_client:e02pq1vJD4gKBVMH@cluster0.jtray.mongodb.net/shop?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

var products = [
    new Product({
        name: 'P-Alaxin',
        imagepath: '/images/p-alaxin.jpg',
        price: 1000,
        tag: 'Antimalaria',
        noOfProductInStock: 10
    }),
    new Product({
        name: 'Coartem D-12',
        imagepath: '/images/coartem-d-12.jpg',
        price: 2000,
        tag: 'Antimalaria',
        noOfProductInStock: 12
    }),
    new Product({
        name: 'Coartem 80/480',
        imagepath: '/images/coartem-80-480.jpg',
        price: 2000,
        tag: 'Antimalaria',
        noOfProductInStock: 12
    }),
    new Product({
        name: 'Lonart DS',
        imagepath: '/images/lonart-ds.jpg',
        price: 2000,
        tag: 'Antimalaria',
        noOfProductInStock: 12
    }),
    new Product({
        name: 'Lonart Dispersible',
        imagepath: '/images/lonart-dispersible.jpg',
        price: 2000,
        tag: 'Antimalaria',
        noOfProductInStock: 12
    }),
    new Product({
        name: 'Amatem Softgel',
        imagepath: '/images/amatem-soft-gel.jpg',
        price: 2000,
        tag: 'Antimalaria',
        noOfProductInStock: 12
    }),
    new Product({
        name: 'Lycoset Capsule',
        imagepath: '/images/lycoset.jpg',
        price: 2000,
        tag: 'Multivitamin',
        noOfProductInStock: 12
    }),
    new Product({
        name: 'Alphabetic Plus',
        imagepath: '/images/alphabetic.jpg',
        price: 2000,
        tag: 'Multivitamin',
        noOfProductInStock: 12
    }),
    new Product({
        name: 'Immunocal',
        imagepath: '/images/immunocal.jpg',
        price: 2000,
        tag: 'Multivitamin',
        noOfProductInStock: 12
    }),
    new Product({
        name: 'Mason Biotin 800 MCG',
        imagepath: '/images/masons-biotin-800.jpg',
        price: 2000,
        tag: 'Multivitamin',
        noOfProductInStock: 12
    }),
    new Product({
        name: 'Nature\'s Benefit Men Mega Multi Dietary Supplement',
        imagepath: '/images/nature-benefit-mega.jpg',
        price: 2000,
        tag: 'Multivitamin',
        noOfProductInStock: 12
    }),
    new Product({
        name: 'Fine Test Auto Coding Blood Glucose Machine',
        imagepath: '/images/fine-test-auto-coding.jpg',
        price: 2000,
        tag: 'Equipment',
        noOfProductInStock: 12
    }),
    new Product({
        name: 'On Call Plus II Blood Glucose Monitoring System',
        imagepath: '/images/on-call-plus.jpg',
        price: 2000,
        tag: 'Equipment',
        noOfProductInStock: 12
    }),
    new Product({
        name: 'Emergency First Aid Box',
        imagepath: '/images/first-aid.jpg',
        price: 2000,
        tag: 'Equipment',
        noOfProductInStock: 12
    }),
    new Product({
        name: 'Omron 5 Series Blood Pressure Monitor Machine',
        imagepath: '/images/omron-5-series.jpg',
        price: 2000,
        tag: 'Equipment',
        noOfProductInStock: 12
    }),
];

var done = 0;
for (var i = 0; i < products.length; i++) {
    products[i].save(function (err, result) {
        done++;
        if (done === products.length) {
            exit();
        }
    });
}
function exit() {
    mongoose.disconnect();
}


