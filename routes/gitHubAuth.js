const express = require('express')
const router = express.Router()
const passport = require('passport')
const GithubStrategy = require('passport-github2').Strategy
const session = require('express-session')

require('dotenv').config()


router.use(
    session({
        secret: process.env.GITHUB_CLIENT_SECRET,
        resave: false,
        saveUninitialized: false,
    })
)

router.use(passport.initialize())
router.use(passport.session())

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

passport.use(
    new GithubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL
    }, (accessToken, refreshToken, profile, done) => {

        return done(null, profile)
    })
)

router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }), (req, res) => {
    console.log(req.user)
})

router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    console.log(req.user)
    res.redirect('/success')
})

router.get('/success', (req, res) => {
    res.redirect('http://localhost:3000/Homepage')
})


module.exports = router