const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: "https://tse2.mm.bing.net/th?id=OIP.tT6tBsjQq6RzVEjT-nHiXgHaHa&pid=Api&P=0&h=180"
    },
    posts: [{
        title: String,
        content: String
    }],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel'
        },

    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel'
        }
    ]
})

module.exports = mongoose.model('userModel', userSchema, 'Users')