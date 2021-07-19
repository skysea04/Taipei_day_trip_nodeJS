let urlParams = new URLSearchParams(window.location.search)
const orderNumber = urlParams.get('number')
const orderNumberAPI = `/api/order/${orderNumber}`
const bookingContainer = document.querySelector('.booking-container')
const headLine = document.querySelector('.headline')
const showOrderNumber = document.querySelector('.order-number')

function getUserData(){
    fetch(userAPI)
    .then(res => res.json())
    .then(data => {
        if(data.data != null){
            headLine.innerText = `${data.data.name}，感謝您的訂購，本次訂購行程如下：`
            showOrderNumber.innerText = `訂單編號：${orderNumber}`
        }else{
            window.location.href='/';
        }
    })
}
getUserData()

function getOrderData(){
    fetch(orderNumberAPI)
    .then(res => res.json())
    .then(data => data.data)
    .then(bookings => {    
        const trip = []
        bookings.trip.forEach(booking => {
            //將到時候要送出order的行程資料先建立起來
            const bookingData = {
                id: booking.id,
                attraction: {
                    id: booking.attraction.id,
                    name: booking.attraction.name,
                    address: booking.attraction.address,
                    image: booking.attraction.image
                },
                date: booking.date,
                time: booking.time
            }
            trip.push(bookingData)

            //行程確認form
            const itineraryForm = document.createElement('form')
            itineraryForm.classList.add('itinerary')
            
            //景點照片
            const attrImg = document.createElement('img')
            attrImg.src = booking.attraction.image
            
            //包行程資訊
            const attrInfo = document.createElement('div')
            attrInfo.classList.add('info')
            
            //景點名稱
            const attrName = document.createElement('h4')
            attrName.innerText = `台北一日遊：${booking.attraction.name}`

            //date 資訊
            const dateContain = document.createElement('div')
            const dateLabel = document.createElement('label')
            const dateSpan = document.createElement('span')
            dateLabel.innerText = '日期：'
            dateSpan.innerText = booking.date
            dateContain.append(dateLabel, dateSpan)
            
            //time 資訊
            const timeContain = document.createElement('div')
            const timeLabel = document.createElement('label')
            const timeSpan = document.createElement('span')
            timeLabel.innerText = '時間：'
            timeSpan.innerText = (booking.time == 'morning')? '早上 9 點到下午 4 點': '下午 2 點到晚上 9 點'
            timeContain.append(timeLabel, timeSpan)


            //address 資訊
            const addressContain = document.createElement('div')
            const addressLabel = document.createElement('label')
            const addressSpan = document.createElement('span')
            addressLabel.innerText = '地點：'
            addressSpan.innerText = booking.attraction.address
            addressContain.append(addressLabel, addressSpan)

            //訂單id（隱藏資訊）
            const bookingId = document.createElement('input')
            bookingId.style.display = 'none'
            bookingId.value = booking.id

            //將資訊們包起來
            attrInfo.append(attrName, dateContain, timeContain, addressContain, bookingId)
            itineraryForm.append(attrImg, attrInfo)
            bookingContainer.append(itineraryForm)

        })
        const name = document.querySelector('span.name') 
        const email = document.querySelector('span.email') 
        const phone = document.querySelector('span.phone') 
        const price = document.querySelector('span.price')
        name.innerText = bookings.contact.name
        email.innerText = bookings.contact.email
        phone.innerText = bookings.contact.phone
        price.innerText = `${bookings.price} 元`
        
    })
}

getOrderData()
