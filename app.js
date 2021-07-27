const express = require('express')
const session = require('express-session')
const helmet = require('helmet')

const app = express()

const sess = {
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {}
}
if (app.get('env') === 'production') {
    // app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess))
app.use(helmet())

app.set('views', 'views')
app.set('view engine', 'ejs')


app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

// API
const userAPI = require('./router/api/user')
const attractionAPI = require('./router/api/attraction')
const bookingAPI = require('./router/api/booking')
const orderAPI = require('./router/api/order')
app.use('/api', userAPI)
app.use('/api', attractionAPI)
app.use('/api', bookingAPI)
app.use('/api', orderAPI)

// Page
const userPage = require('./router/page/user')
const attractionPage = require('./router/page/attraction')
app.use(userPage)
app.use(attractionPage)

app.listen(3000, () => {
    console.log(`taipei_trip listening at http://localhost:3000`)
})