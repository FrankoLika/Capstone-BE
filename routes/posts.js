const express = require('express')
const router = express.Router()
const postModel = require('../models/posts')
const userModel = require('../models/users')
const multer = require('multer')

const internalStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const fileExt = file.originalname.split('.').pop()
        cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExt}`)
    }
})

const internalUpload = multer({ storage: internalStorage })

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