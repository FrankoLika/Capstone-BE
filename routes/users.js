const express = require('express');
const router = express.Router()
const UsersModel = require('../models/users')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator');

router.get('/users', async (req, res) => {
    try {
        const users = await UsersModel.find()
        res.status(200).send(users)
    } catch (error) {
        res.status(500)
            .send({
                message: 'internal server error',
                statusCode: 500
            })
    }
})

router.get('/users/:id', async (req, res) => {
    const userId = req.params.id
    try {
        const user = await UsersModel.findById(userId);

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'user does not exist' });
        }
    } catch (error) {
        res.status(500)
            .send({
                message: 'internal server error',
                statusCode: 500
            })
    }
});

router.post('/register', [
    body('username').notEmpty().withMessage('username field is required'),
    body('email').isEmail().withMessage('email must be valid'),
    body('password').isLength({ min: 6 }).withMessage('password is required and must be at least 6 characters long')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
    }
    try {
        const { username, email, password } = req.body

        const existingUser = await UsersModel.findOne({ email })
        if (existingUser) {
            return res.status(400)
                .send({
                    message: 'email already in db',
                    statusCode: 400
                })
        }

        const genSalt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, genSalt);

        const newUser = new UsersModel({
            username: username,
            email: email,
            password: hashedPassword,
        })

        const savedUser = await newUser.save();

        res.status(201).json({
            message: 'saved user',
            savedUser,
        });
    } catch (error) {
        res.status(500)
            .send({
                message: 'internal server error',
                statusCode: 500,
            })
    }
})

router.patch('/users/:id', [
    body('username').optional().notEmpty().withMessage('the username field is required'),
    body('email').optional().isEmail().withMessage('email must be valid'),
    body('password').optional().isLength({ min: 6 }).optional().withMessage('password must be at least 6 characters long')
], async (req, res) => {
    const { id } = req.params;
    const userExist = await UsersModel.findById(id)

    if (!userExist) {
        return res.status(404).send({
            message: 'user does not exist',
            statusCode: 404,
        })
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
    }

    try {
        const userId = id;
        const dataUpdate = req.body;
        const options = { new: true }

        const result = await UsersModel.findByIdAndUpdate(userId, dataUpdate, options)
        res.status(200).send({
            message: 'updated user',
            payload: result
        })
    } catch (error) {
        res.status(500)
            .send({
                message: 'internal server error',
                statusCode: 500,
            })
    }
})

router.delete('/users/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await UsersModel.findByIdAndDelete(id)
        if (!user) {
            return res.status(404).send({
                message: 'user does not exist',
                statusCode: 404,
            })
        }
        res.status(200).send({
            message: `user ${id} successfully removed`,
            statusCode: 200,
        })
    } catch (error) {
        res.status(500).send({
            message: 'internal server error',
            statusCode: 500,
        })
    }
})

//route followings followers
router.post("/follow/:userToFollow/:user", async (req, res) => {
    const { userToFollow, user } = req.params;

    try {
        const currentUser = await UsersModel.findById(user);
        const currentUserToFollow = await UsersModel.findById(userToFollow);

        if (!currentUser || !currentUserToFollow) {
            return res.status(404).json({ error: "User not found" });
        }

        if (currentUser.following.includes(currentUserToFollow._id)) {
            return res.status(400).json({ error: "You are already following this user" });
        }

        currentUser.following.push(currentUserToFollow._id);

        currentUserToFollow.followers.push(currentUser._id);

        await currentUser.save();
        await currentUserToFollow.save();

        res.status(200).json({ message: "User followed successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

router.delete("/follow/:userToUnfollow/:user", async (req, res) => {
    const { userToUnfollow, user } = req.params;

    try {
        const currentUser = await UsersModel.findById(user);
        const currentUserToUnfollow = await UsersModel.findById(userToUnfollow);

        if (!currentUser || !currentUserToUnfollow) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!currentUser.following.includes(currentUserToUnfollow._id)) {
            return res.status(400).json({ error: "You are not following this user" });
        }

        const currentUserIndex = currentUser.following.indexOf(currentUserToUnfollow._id);
        currentUser.following.splice(currentUserIndex, 1);

        const userToUnfollowIndex = currentUserToUnfollow.followers.indexOf(currentUser._id);
        currentUserToUnfollow.followers.splice(userToUnfollowIndex, 1);

        await currentUser.save();
        await currentUserToUnfollow.save();

        res.status(200).json({ message: "Unfollowed user successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router