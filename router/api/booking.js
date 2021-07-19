const express = require('express')
const {pool} = require('../model')
const bookingAPI = express.Router()

module.exports = bookingAPI