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

userPage.get('/.well-known/pki-validation/:file', (req, res) => {
    var file = req.params.file
    res.sendFile(`/home/ubuntu/${file}`)
})

module.exports = userPage