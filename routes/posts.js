const express = require('express')
const router = express.Router()
const postModel = require('../models/posts')
const userModel = require('../models/users')

router.get('/posts', async (req, res) => {
    try {
        const posts = await postModel.find()
            .populate('author')
        res.status(200)
            .send(posts)
    } catch (error) {
        res.status(500)
            .send({
                message: 'internal server error',
                statusCode: 500
            })
    }
})






module.exports = router;