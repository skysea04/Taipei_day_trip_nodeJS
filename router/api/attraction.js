const express = require('express')
const {pool, errorData} = require('../model')
const attractionAPI = express.Router()

async function selectAttr(firstIndex, keyword=null){
    if(!keyword){
        const [attrs] = await pool.query('SELECT * FROM attraction LIMIT ?, 12', [firstIndex])
        return attrs
    }else{
        const [attrs] = await pool.query('SELECT * FROM attraction WHERE name LIKE ? LIMIT ?, 12', [`%${keyword}%`,firstIndex])
        return attrs
    }
}

attractionAPI.get('/attractions', async(req, res) => {
    try{
        if(req.query.page){
            const page = parseInt(req.query.page)
            const firstIndex = page * 12
            if(req.query.keyword){
                const keyword = req.query.keyword
                const attrs = await selectAttr(firstIndex, keyword)
                const next_attrs = await selectAttr(firstIndex+12, keyword)
                const nextPage = next_attrs[0] ? page+1 : null
                return res.jsonp({
                    nextPage: nextPage,
                    data: attrs
                })
            }else{
                const attrs = await selectAttr(firstIndex)
                const next_attrs = await selectAttr(firstIndex + 12)
                const nextPage = next_attrs[0] ? page+1 : null
                return res.jsonp({
                    nextPage: nextPage,
                    data: attrs
                })
            }
        }
        return res.status(400).jsonp({
            error: true,
            message: '缺少景點頁數'
        })
    }catch{
        return res.status(500).jsonp(errorData.serverError)
    }
    
})

attractionAPI.get('/attraction/:id', async(req, res) => {
    try{
        id = req.params.id
        const [[attraction]] = await pool.query('SELECT * FROM attraction WHERE id = ?', [id])
        if(attraction){
            return res.jsonp({data: attraction})
        }else{
            return res.status(400).jsonp({
                error: true,
                message: '景點編號不正確'
            })
        }
    }catch{
        return res.status(500).jsonp(errorData.serverError)
    }
})


module.exports = attractionAPI