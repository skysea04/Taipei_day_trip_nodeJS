const mysql = require('mysql2')
require('dotenv').config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0
})
const promisePool = pool.promise()

const errorData = {
    serverErrorData: {
        error: true,
        message: '伺服器內部錯誤'
    }
}

module.exports = {
    pool: promisePool,
    errorData: errorData
}