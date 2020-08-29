var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
   user: {type: Schema.Types.ObjectId, ref: 'User'},
   cart: {type: String, required: true},
   totalprice: {type: Number},
   totalquantity: {type: Number},
   email: {type: String, required: true},
   paymentId: {type: String, required: true},
   orderDate: {type: Date, required: true}
});

module.exports = mongoose.model('Order', schema);