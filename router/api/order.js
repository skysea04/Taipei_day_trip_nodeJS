const express = require('express')
const {pool} = require('../model')
const orderAPI = express.Router()

module.exports = orderAPI