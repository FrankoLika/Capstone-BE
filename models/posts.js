const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    img: {
        type: String,
        required: false,
        default: "https://tse2.mm.bing.net/th?id=OIP.tT6tBsjQq6RzVEjT-nHiXgHaHa&pid=Api&P=0&h=180"
    },
    likes:{
        type: Number,
        default: 0,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel',
    },
}, { timestamps: true, strict: true })

module.exports = mongoose.model('postModel', postSchema, 'Posts')