const express = require('express')
const {pool, errorData} = require('../model')
const userAPI = express.Router()

userAPI.get('/user', (req, res) => {
    if(req.session.user){ // 有登入
        return res.jsonp({data: req.session.user})
    }else{ // 沒登入
        return res.status(403).jsonp({data: null})
    }
})

userAPI.post('/user', async(req, res) =>{
    try{
        const reqData = req.body
        const name = reqData.name, email = reqData.email, password = reqData.password
        let [[user]] = await pool.query('SELECT * FROM user WHERE email = ?', [email])
        if(!user){ // 沒有註冊過，加入帳號資訊
            let [newUser] = await pool.execute('INSERT INTO user(name, email, password) VALUES (?, ?, ?)', [name, email, password])
            return res.jsonp({ok: true})
        }else{ // 帳號已經註冊過，回傳失敗資訊
            return res.status(400).jsonp({
                error: true,
                message: '註冊失敗，該email已經被註冊過了'
            })
        }
    }catch{
        return res.status(500).jsonp(errorData.serverErrorData)
    }
})

userAPI.patch('/user', async(req, res) => {
    try{
        const reqData = req.body
        const email = reqData.email, password = reqData.password
        let [[user]] = await pool.query('SELECT * FROM user WHERE email = ? AND password = ?', [email, password])
        if(user){ // 登入成功
            req.session.user = {
                id: user.id,
                name: user.name,
                email: user.email
            }
            return res.jsonp({ok: true})
        }else{ // 登入失敗
            return res.status(403).jsonp({
                error: true,
                message: '登入失敗，帳號或密碼輸入錯誤'
            })
        }  
    }catch{
        return res.status(500).jsonp(errorData.serverErrorData)
    }
})

userAPI.delete('/user', (req, res) => {
    req.session.destroy()
    return res.jsonp({ok: true})
})

module.exports = userAPI