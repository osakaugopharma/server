var mongoose = require('mongoose');
// var Schema = mongoose.Schema;

const UploadedFile = new mongoose.Schema({
    path: {type: String, required: true},
    type: {type: String, required: true},
    size: {type: Number, required: true},
    folder: {type:String, required: true},
    filename: {type:String, required: true}
})

const Product = new mongoose.model('Product', {
    name: { type: String, required: true },
    imagepath: { type: String, required: true },
    price: { type: Number, required: true },
    tag: { type: String, required: true },
    noOfProductInStock: { type: Number, required: true },
    imagealt: { type: String, required: true },
    uploadedFile: UploadedFile
})

// const customUploadPath = `/uploads/${uploadedFile.filename}`
// var schema = new Schema({
//     name: { type: String, required: true },
//     imagepath: { type: String, required: true },
//     price: { type: Number, required: true },
//     tag: { type: String, required: true },
//     noOfProductInStock: { type: Number, required: true },
//     imagealt: { type: String, required: true },
//     uploadedFile: uploadedFile
// });



module.exports = Product