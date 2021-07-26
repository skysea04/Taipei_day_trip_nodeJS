const mysql = require('mysql2');
const moment = require('moment')
require('dotenv').config()

function deleteExpireBooking(){
    const threeDaysLater = moment().startOf('day').add(3, 'days').format('YYYY-MM-DD')
    console.log(threeDaysLater)
    const con = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    })
    con.promise().query('DELETE FROM booking WHERE date < ? AND order_number is null', [threeDaysLater])
        .then( ([rows,fields]) => {
            console.log(rows);
            console.log('finish')
        })
        .catch(console.log)
        .then( () => con.end());
}

deleteExpireBooking()