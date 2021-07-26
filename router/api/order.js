const express = require('express')
const moment = require('moment')
const axios = require('axios')
const {pool, errorData} = require('../model')
const orderAPI = express.Router()
require('dotenv').config()
const partnerKey = process.env.PARTNER_KEY
const merchantID = process.env.MERCHANT_ID

orderAPI.get('/order', async(req, res) => {
    try{
        if(req.session.user){
            const userID = req.session.user.id
            const [bookings] = await pool.query('SELECT booking.date, booking.time, booking.price, booking.order_number, booking.refund, attraction.name, attraction.address, attraction.images\
            FROM booking INNER JOIN attraction ON booking.attraction_id = attraction.id\
            WHERE booking.user_id = ? AND booking.pay IS true ORDER BY booking.id DESC', [userID])
            // 建立外層陣列
            const orderLst = []
            let orderData = {
                orderNumber: '',
                order: [],
                refund: false
            }
            bookings.forEach(booking => {
                const order = {
                    price: booking.price,
                    attraction: {
                        address: booking.address,
                        image: booking.images[0],
                        name: booking.name
                    },
                    date: moment(booking.date).format('YYYY-MM-DD'),
                    time: booking.time
                }
                // deep clone
                const tmpData = JSON.parse(JSON.stringify(orderData))
                if(tmpData.orderNumber === booking.order_number){
                    orderLst.pop()
                    tmpData.order.push(order)
                }else{
                    tmpData.order = [order]
                    tmpData.orderNumber = booking.order_number
                    tmpData.refund = booking.refund === 0 ? false : true
                }
                // console.log(tmpData)
                orderLst.push(tmpData)
                orderData = tmpData
                
            })
            // console.log(orderLst)
            if(!orderLst){
                orderLst = null
            }
            return res.jsonp({data: orderLst})
        }else{
            return res.status(403).jsonp(errorData.noSign)
        }
    }
    catch{
        return res.status(500).jsonp(errorData.serverError)
    }
})

orderAPI.get('/order/:orderNumber', async(req, res) => {
    if(req.session.user){
        const orderNum = req.params.orderNumber
        const orderDate = orderNum.slice(0,8)
        const userID = req.session.user.id
        const [bookings] = await pool.query('SELECT booking.id, booking.attraction_id, booking.date, booking.time, booking.price, attraction.name, attraction.address, attraction.images\
        FROM booking INNER JOIN attraction ON booking.attraction_id = attraction.id\
        WHERE booking.order_number = ? AND booking.user_id = ?', [orderNum, userID])
        if(bookings[0]){ //當有資料時才去串 TapPay要資料
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
                    date: moment(booking.date).format('YYYY-MM-DD'),
                    time: booking.time
                }
                bookingLst.push(bookingData)
            })
            // TapPay串接
            const recURL = 'https://sandbox.tappaysdk.com/tpc/transaction/query'
            const recBody = {
                partner_key: partnerKey,
                filters: {
                    time:{
                      start_time: moment(orderDate, 'YYYYMMDD').valueOf(),
                      end_time: moment(orderDate, 'YYYYMMDD').add(1, 'days').valueOf()
                    },
                    order_number: orderNum
                }
            }
            const recHeaders = {
                'Content-type': 'application/json',
                'x-api-key': partnerKey
            }
            const recRes = await axios.post(
                recURL,
                JSON.stringify(recBody),
                {headers: recHeaders}
            )
            // 如果tappay回傳錯誤訊息，先回傳500資訊 
            if(recRes.data.status !== 2 && recRes.data.status !== 0){
                return res.status(500).jsonp(errorData.serverError)
            }
            const recData = recRes.data.trade_records[0]
            // console.log(recData)
            
            return res.jsonp({
                data: {
                    number: orderNum,
                    price: recData.amount,
                    trip: bookingLst,
                    contact: {
                        name: recData.cardholder.name,
                        email: recData.cardholder.email,
                        phone: recData.cardholder.phone_number
                    },
                    status: 1
                }
            })
        }else{
            return res.status(400).jsonp({data: null})
        }

    }else{
        return res.status(403).jsonp(errorData.noSign)
    }
})

orderAPI.post('/order', async(req, res) => {
    try{
        if(req.session.user){
            const userID = req.session.user.id
            const prime = req.body.prime
            const name = req.body.order.contact.name
            const email = req.body.order.contact.email
            const phone = req.body.order.contact.phone
            
            if(prime && name && email && /^09[0-9]{8}$/.test(phone)){
    
                const orderNum = moment().format('YYYYMMDDHHmmssSSS')
                const [[totalPrice]] = await pool.query('SELECT SUM(price) as price FROM booking WHERE user_id = ? AND order_number IS null', [userID])

                // const [[bookings]] = await pool.query('SELECT date FROM booking WHERE user_id')

                await pool.execute('UPDATE booking SET order_number = ? WHERE user_id = ? AND order_number IS null', [orderNum, userID])
                const payURL = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
                const sendPrime = {
                    prime: prime,
                    partner_key: partnerKey,
                    merchant_id: merchantID,
                    order_number: orderNum,
                    details: '一日遊行程',
                    amount: totalPrice.price,
                    cardholder: {
                        phone_number: phone,
                        name: name,
                        email: email
                    },
                    remember: false
                }
                const sendHeaders = {
                    'Content-Type': 'application/json',
                    'x-api-key': partnerKey
                }
                const payRes = await axios.post(
                    payURL,
                    sendPrime,
                    {headers: sendHeaders}
                )
                const resData = payRes.data
                // console.log(resData)
                const recTradeID = resData.rec_trade_id
    
                if(resData.status === 0){
                    // 將所有該orderNum的訂單pay欄位換為true
                    await pool.execute('UPDATE booking SET pay = ? , rec_trade_id = ? WHERE order_number = ?', [true, recTradeID, orderNum])
                    return res.jsonp({
                        data:{
                            number: orderNum,
                            payment: {
                                status: 0,
                                message: '付款成功'
                            }
                        }
                    })
                }else{
                    await pool.execute('UPDATE booking SET rec_trade_id = ? WHERE order_number = ?', [recTradeID, orderNum])
                    return res.jsonp({
                        data:{
                            number: orderNum,
                            payment: {
                                status: resData.status,
                                message: '付款失敗'
                            }
                        }
                    })
                }
                
            }else{
                return res.status(400).jsonp({
                    error: true,
                    message: '訂單建立失敗，輸入不正確或其他原因'
                })
            }
        }else{
            return res.jsonp(errorData.noSign)
        }
    }catch{
        return res.status(500).jsonp(errorData.serverError)
    }
})

orderAPI.delete('/order', async(req, res) => {
    if(req.session.user){
        const userID = req.session.user.id
        const orderNum = req.body.orderNumber
        const threeDaysLater = moment().startOf('day').add(3, 'days')
        let recTradeID = ''

        const [bookings] = await pool.query('SELECT * FROM booking WHERE user_id = ? AND order_number = ? FOR UPDATE', [userID, orderNum])
        bookings.forEach(booking => {
            recTradeID = booking.rec_trade_id
            if(booking.date < threeDaysLater){
                return res.status(400).jsonp({
                    error: true,
                    message: '有行程超過退款期限囉，無法進行退款'
                })
            }
        })

        const refundURL = 'https://sandbox.tappaysdk.com/tpc/transaction/refund'
        const refundBody = {
            partner_key: partnerKey,
            rec_trade_id: recTradeID
        }
        const refundHeaders = {
            'Content-type': 'application/json',
            'x-api-key': partnerKey
        }
        const refundRes = await axios.post(refundURL, refundBody, {headers: refundHeaders})
        const refundData = refundRes.data

        if(refundData.status === 0){
            await pool.execute('UPDATE booking SET refund = ? WHERE user_id = ? AND order_number = ?', [true, userID, orderNum])
            return res.jsonp({
                ok: true,
                message: '退款成功!'
            })
        }else{
            return res.status(400).jsonp({
                error: true,
                message: '退款失敗，請洽詢客服人員'
            })
        }
        
    }else{
        return res.status(403).jsonp(errorData.noSign)
    }
})

module.exports = orderAPI