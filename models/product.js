var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    name: { type: String, required: true },
    imagepath: { type: String, required: true },
    price: { type: Number, required: true },
    tag: { type: String, required: true },
    noOfProductInStock: { type: Number, required: true },
});

module.exports = mongoose.model('Product', schema);