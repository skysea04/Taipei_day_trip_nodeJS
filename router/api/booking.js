const express = require('express')
const moment = require('moment')
const {pool, errorData} = require('../model')
const bookingAPI = express.Router()

bookingAPI.get('/booking', async(req, res) => {
    try{
        if(req.session.user){
            const userID = req.session.user.id
            const [bookings] = await pool.query('SELECT booking.id, booking.attraction_id, booking.date, booking.time, booking.price, attraction.name, attraction.address, attraction.images\
            FROM booking INNER JOIN attraction ON booking.attraction_id = attraction.id\
            WHERE booking.user_id = ? AND booking.order_number IS null', [userID])
            const bookingLst = []
            bookings.forEach(booking => {
                const bookingData = {
                    id: booking.id,
                    attraction: {
                        id: booking.attraction_id,
                        name: booking.name,
                        address: booking.address,
                        image: booking.images[0]
                    },
                    date: moment(booking.date).format("yyyy-MM-DD"),
                    time: booking.time,
                    price: booking.price
                }
                bookingLst.push(bookingData)
            })
            return res.jsonp({data: bookingLst})
        }else{
            return res.status(403).jsonp(errorData.noSign)
        }
    }catch{
        return res.status(500).jsonp(errorData.serverError)
    }
})

bookingAPI.post('/booking', async(req, res) => {
    try{
        if(req.session.user){
            const userID = req.session.user.id
            const attrID = req.body.attractionId
            const date = req.body.date
            const time = req.body.time
            const price = req.body.price
            if(attrID && moment(date) > moment().add(2, 'days') && ((time === 'morning' && price === 2000) || (time === 'afternoon' && price === 2500))){
                const [newBooking] = await pool.execute('INSERT INTO booking\
                (user_id, attraction_id, date, time, price) VALUES\
                (?, ?, ?, ?, ?)', [userID, attrID, date, time, price])
                // console.log(newBooking)
                return res.jsonp({ok: true})
            }else{
                return res.status(400).jsonp({
                    error: true,
                    message: '行程建立失敗，輸入不正確或其他原因'
                })
            }
        }else{
            return res.status(403).jsonp(errorData.noSign)
        }
    }catch{
        return res.status(500).jsonp(errorData.serverError)
    }
})

bookingAPI.delete('/booking', async(req, res) => {
    try{
        if(req.session.user){
            const delID = req.body.id
            const [[booking]] = await pool.query('SELECT * FROM booking WHERE id = ? FOR UPDATE', [delID])
            await pool.execute('DELETE FROM booking WHERE id = ?', [delID])
            return res.jsonp({ok: true})
        }else{
            return res.status(403).jsonp(errorData.noSign)
        }
    }catch{
        return res.status(500).jsonp(errorData.serverError)
    }
})

module.exports = bookingAPI