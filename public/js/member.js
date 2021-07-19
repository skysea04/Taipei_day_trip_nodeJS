// get orderAPI
const orderAPI = '/api/order'
const orders = document.querySelector('.orders')

const fetchOrderAPI = async () => {
    orders.innerHTML = ''
    const res = await fetch(orderAPI)
    const data = await res.json()
    if(data.error){
        const noOrders = document.createElement('h4')
        noOrders.innerText = data.message
        orders.append(noOrders)
    }
    else{
        if(data.data){
            // 建立歷史訂單資訊
            for(let order of data.data){
                let totalPrice = 0
    
                // 建立orderForm
                const orderForm = document.createElement('form')
                orderForm.classList.add('order')
                
                // 建立訂單編號
                const orderNumberContain = document.createElement('h4')
                const orderNumber = document.createElement('a')
                orderNumber.href = `thankyou?number=${order.orderNumber}`
                orderNumber.innerText = order.orderNumber
                orderNumberContain.innerText = '訂單編號：'
                orderNumberContain.append(orderNumber)
    
                // 包覆產品資訊們
                const bookings = document.createElement('div')
                bookings.classList.add('bookings')
                
                //建立產品資訊
                for(let booking of order.order){
                    // 計算price總額
                    totalPrice += booking.price
    
                    // date 資訊
                    const dateContain = document.createElement('div')
                    const dateLabel = document.createElement('label')
                    dateLabel.innerText = '日期：'
                    const dateSpan = document.createElement('span')
                    dateSpan.innerText = booking.date
                    dateContain.append(dateLabel, dateSpan)
                    
                    // time 資訊
                    const timeContain = document.createElement('div')
                    const timeLabel = document.createElement('label')
                    timeLabel.innerText = '時間：'
                    const timeSpan = document.createElement('span')
                    timeSpan.innerText = (booking.time == 'morning')? '早上 9 點到下午 4 點': '下午 2 點到晚上 9 點'
                    timeContain.append(timeLabel, timeSpan)
                    
                    // price 資訊
                    const priceContain = document.createElement('div')
                    const priceLabel = document.createElement('label')
                    priceLabel.innerText = '費用：'
                    const priceSpan = document.createElement('span')
                    priceSpan.innerText = booking.price
                    priceContain.append(priceLabel, priceSpan)
                    
                    // address 資訊
                    const addressContain = document.createElement('div')
                    const addressLabel = document.createElement('label')
                    addressLabel.innerText = '地點：'
                    const addressSpan = document.createElement('span')
                    addressSpan.innerText = booking.attraction.address
                    addressContain.append(addressLabel, addressSpan)
                    
                    //包覆date和time資訊的div
                    const dateTimeContain = document.createElement('div')
                    dateTimeContain.append(dateContain, timeContain)
                    
                    //包覆price和address資訊的div
                    const priceAddressContain = document.createElement('div')
                    priceAddressContain.append(priceContain, addressContain)
                    
                    // 包覆細節
                    const bookingContainer = document.createElement('div')
                    bookingContainer.classList.add('booking-container')
                    bookingContainer.append(dateTimeContain, priceAddressContain)
                    
                    //景點名稱
                    const name = document.createElement('p')
                    name.innerText = booking.attraction.name
                    
                    // 個別行程資訊
                    const info = document.createElement('div')
                    info.classList.add('info')
                    info.append(name, bookingContainer)
                    
                    // 景點照片
                    const image = document.createElement('img')
                    image.src = booking.attraction.image
    
                    // 包覆個別行程
                    const itinerary = document.createElement('div')
                    itinerary.classList.add('itinerary')
    
                    itinerary.append(image, info)
                    bookings.append(itinerary)
                    
                }
    
                // 總價格
                const price = document.createElement('h4')
                price.classList.add('total-price')
                price.innerText = `總價：${totalPrice} 元`
                
                // 退款按鈕
                const refundBtn = document.createElement('button')
                refundBtn.classList.add('refund')
                refundBtn.type = 'submit'
                refundBtn.innerText = '退款'
    
                // 建立提醒字樣
                const notice = document.createElement('p')
                notice.classList.add('notice')
                
                if(order.refund === false){
                    notice.innerText = '注意！訂購行程日期三天內不再接受任何退款'
                }else{
                    notice.innerText = '本訂單已取消'
                    notice.classList.add('disabled')
                    refundBtn.disabled = "disabled"
    
                }
    
                // 包覆付款相關資訊
                const payInfo = document.createElement('div')
                payInfo.classList.add('pay-info')
                payInfo.append(price, refundBtn, notice)
    
                // 分隔線
                const seperator = document.createElement('div')
                seperator.classList.add('seperator')
                
                orderForm.append(orderNumberContain, bookings, payInfo, seperator)
                orders.append(orderForm)
            }
    
        }
        else{
            const noOrders = document.createElement('h4')
            noOrders.innerText = "沒有任何訂單記錄"
            orders.append(noOrders)
        }
    
        const orderForms = document.querySelectorAll('.order')
    
        async function refund(e){
            e.preventDefault()
            const orderNumber = this.querySelector('h4 span').innerText
            const body = {
                orderNumber: orderNumber
            }
            
            const res = await fetch(orderAPI, {
                method: 'DELETE',
                body: JSON.stringify(body),
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            })
            const data = await res.json()
            alert(data.message)
            // 如果退款成功，才會重新建構DOM
            if(data.ok){
                fetchOrderAPI()
            }
        }
    
        orderForms.forEach(orderForm => {
            orderForm.addEventListener('submit', refund)
        })
    }
} 

fetchOrderAPI()