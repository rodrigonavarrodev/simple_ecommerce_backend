const mongoose = require('mongoose')
const categorySchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
        unique: 1,
        maxlenght: 100
    }
})

const Category = mongoose.model('Category', categorySchema, "categories" )
module.exports = { Category }