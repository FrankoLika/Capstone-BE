const express = require('express')
const router = express.Router()
const userModel = require('../models/users')
const postModel = require('../models/posts')
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
        res.status(200).send(posts)
    } catch (error) {
        res.status(500)
            .send({
                message: 'internal server error',
                statusCode: 500,
            })
    }
})

router.post('/posts/uploadImg', internalUpload.single('img'), async (req, res) => {
    const url = req.protocol + '://' + req.get('host')

    try {
        const imgUrl = req.file.filename
        res.status(200).json({
            img: `${url}/uploads/${imgUrl}`
        })
    } catch (error) {
        console.error('File upload failed:', error)
        res.status(500).send({
            message: 'File upload error',
            statusCode: 500
        })
    }
})

router.post('/posts/new/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { title, content, img } = req.body;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).send({
                message: 'User not found',
                statusCode: 404,
            });
        }

        const post = new postModel({
            title: title,
            content: content,
            author: userId,
            img: img
        })

        const postExist = await postModel.findOne({ title: title })
        if (postExist) {
            return res.status(409).json({ message: 'post già esistente' })
        }
        const newPost = await post.save()

        user.posts.push(newPost);

        await user.save();

        res.status(201).send({
            message: 'post created',
            statusCode: 201,
            newPost
        });
    } catch (error) {
        res.status(500)
            .send({
                message: 'internal server error',
                statusCode: 500,
            })
    }
});

router.delete('/posts/delete/:userId/:postId', async (req, res) => {
    const { userId, postId } = req.params;
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(404).send({
                message: 'User not found',
                status: 404
            });
        }

        const postIndex = user.posts.findIndex(post => post._id.toString() === postId);

        if (postIndex === -1) {
            return res.status(404).send({
                message: 'Post not found',
                status: 404
            });
        }

        user.posts.splice(postIndex, 1);
        await user.save();

        const post = await postModel.findByIdAndDelete(postId)
        if (!post) {
            return res.status(404).send({
                message: 'Post not found',
                stauts: 404
            })
        }
        res.status(200).send({
            message: `post ${postId} successfully removed`,
            status: 200
        })
    } catch (error) {
        res.status(500).send({
            message: 'internal server error',
            statusCode: 500,
        })
    }
})



module.exports = router;