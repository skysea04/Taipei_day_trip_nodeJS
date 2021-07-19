const express = require('express')
const session = require('express-session')
const app = express()

const sess = {
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {}
}
if (app.get('env') === 'production') {
app.set('trust proxy', 1) // trust first proxy
sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess))

app.set('views', 'views')
app.set('view engine', 'ejs')

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.listen(3000, () => {
    console.log(`taipei_trip listening at http://localhost:3000`)
})