const express = require('express')
const userPage = express.Router()

userPage.get('/booking', (req, res) => {
    return res.render('booking')
})

userPage.get('/thankyou', (req, res) => {
    return res.render('thankyou')
})

userPage.get('/member', (req, res) => {
    return res.render('member')
})

module.exports = userPage