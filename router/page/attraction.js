const express = require('express')
const attractionPage = express.Router()

attractionPage.get('/', (req, res) => {
    return res.render('index')
})

attractionPage.get('/attraction/:id', (req, res) => {
    return res.render('attraction')
})

module.exports = attractionPage