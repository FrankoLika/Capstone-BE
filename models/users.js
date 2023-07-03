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
    posts: [{
        title: String,
        content: String
    }],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel'
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel'
        }
    ]

})

module.exports = mongoose.model('userModel', userSchema, 'Users')