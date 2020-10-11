var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
   name: { type: String, required: true },
   cart: { type: String, required: true },
   totalprice: { type: Number },
   totalquantity: { type: Number },
   email: { type: String, required: true },
   paymentId: { type: String, required: true },
   orderDate: { type: Date, required: true },
   address: { type: String, required: true },
   phone: { type: String, required: true }
});

module.exports = mongoose.model('Order', schema);