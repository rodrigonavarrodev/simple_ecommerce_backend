const mongoose = require('mongoose')
const Schema = mongoose.Schema
const productSchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
        unique: 1,
        maxlenght: 100
    },
    description: {
        required: true,
        type: String,
        maxlenght: 10000
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    price: {
        required: true,
        type: Number,
        maxlenght: 255
    },
    shipping: {
        required: true,
        type: Boolean
    },
    available: {
        required: true,
        type: Boolean
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    publish: {
        required: true,
        type: Boolean
    },
    images: {
        type: Array,
        default: []
        } 
    }, 
    {timestamps: true
})

const Product = mongoose.model('Product', productSchema, 'Products')
module.exports = { Product }