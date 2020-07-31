var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
   user: {type: Schema.Types.ObjectId, ref: 'User'},
   cart: {type: Object, required: true},
   email: {type: String, required: true},
   paymentId: {type: String, required: true},
   //    address: {type: String, required: true},  ADD THIS LATER
});

module.exports = mongoose.model('Order', schema);