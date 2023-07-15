const express = require('express')
const router = express.Router()
const UsersModel = require('../models/users')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    const user = await UsersModel.findOne({
        email: req.body.email
    })

    try {
        if (!user) {
            return res.status(404).send({
                message: "user does not exist with this email",
                statusCode: 404
            })
        }
        const validPassword = await bcrypt.compare(req.body.password, user.password)
        if (!validPassword) {
            return res.status(400).send({
                message: 'wrong password',
                statusCode: 400
            })
        }
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET_JWT_KEY, { expiresIn: "12h" })
        return res.status(200).send({
            message: 'Logged',
            token: token,
            userId: user._id,
            statusCode: 200,
        });
    } catch (error) {
        res.status(500)
            .send({
                message: 'All fields are required',
                statusCode: 500
            })
    }
})

module.exports = router