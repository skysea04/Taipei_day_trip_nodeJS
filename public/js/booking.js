//抓user api資料
const bookingAPI = '/api/booking'
const orderAPI = '/api/order'
const headLine = document.querySelector('.headline')
const orderForm = document.querySelector('.order')
const inputName = orderForm.querySelector('input[name="name"]')
const inputEmail = orderForm.querySelector('input[name="email"]')

function getUserData(){
    fetch(userAPI)
    .then(res => res.json())
    .then(data => {
        if(data.data != null){
            headLine.innerText = `您好，${data.data.name}，待預定的行程如下：`
            inputName.value = data.data.name
            inputEmail.value = data.data.email
        }else{
            window.location.href='/';
        }
    })
}

getUserData()


//抓booking api資料
const bookingContainer = document.querySelector('.booking-container')
const errorMessage = document.querySelector('.error-message')
let totalPrice = 0
let itineraryForms

// 獲取行程資料
function getBookingData(){
    bookingContainer.innerHTML = ''
    totalPrice = 0
    fetch(bookingAPI)
    .then(res => res.json())
    .then(data => data.data)
    .then(bookings => {    
        const trip = []
        bookings.forEach(booking => {
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

            //刪除按鈕
            const deleteButton = document.createElement('button')
            const icon = document.createElement('i')
            deleteButton.type = 'submit'
            icon.classList.add('fas', 'fa-trash-alt')
            deleteButton.append(icon)

            //date 資訊
            const dateContain = document.createElement('div')
            const dateLabel = document.createElement('label')
            const dateSpan = document.createElement('span')
            dateLabel.innerText = '日期：'
            dateSpan.innerText = booking.date
            dateContain.append(dateLabel, dateSpan)
            
            //time 資訊(時間的詳細資訊還有待修正)
            const timeContain = document.createElement('div')
            const timeLabel = document.createElement('label')
            const timeSpan = document.createElement('span')
            timeLabel.innerText = '時間：'
            timeSpan.innerText = (booking.time == 'morning')? '早上 9 點到下午 4 點': '下午 2 點到晚上 9 點'
            timeContain.append(timeLabel, timeSpan)

            //price 資訊
            const priceContain = document.createElement('div')
            const priceLabel = document.createElement('label')
            const priceSpan = document.createElement('span')
            priceLabel.innerText = '費用：'
            priceSpan.innerText = booking.price
            priceContain.append(priceLabel, priceSpan)

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
            attrInfo.append(attrName, deleteButton, dateContain, timeContain, priceContain, addressContain, bookingId)
            itineraryForm.append(attrImg, attrInfo)
            bookingContainer.append(itineraryForm)

            //計算總金額
            totalPrice += booking.price
        })
        if(bookingContainer.innerHTML !== ''){
            //有booking時的頁面呈現
            hasBooking()
        }else{
            // 沒有booking時的頁面呈現
            noBooking()
        }

        // 送出訂單資訊＆付款
        function sendOrder(e) {
            e.preventDefault()
        
            // 取得 TapPay Fields 的 status
            const tappayStatus = TPDirect.card.getTappayFieldsStatus()
            console.log(tappayStatus)
        
            // 確認是否可以 getPrime
            if (tappayStatus.canGetPrime === false) {
                alert('can not get prime')
                return
            }
        
            // Get prime
            const getPrime = new Promise((resolve, reject) => {
                TPDirect.card.getPrime((result) => {
                    if (result.status !== 0) {
                        alert('get prime error ' + result.msg)
                        return
                    }
                    // alert('get prime 成功，prime: ' + result.card.prime)       
                    resolve(result.card.prime)
                    // send prime to your server, to pay with Pay by Prime API .
                    // Pay By Prime Docs: https://docs.tappaysdk.com/tutorial/zh/back.html#pay-by-prime-api
                })
            })
            
            // 將訂單資訊傳送到後端接收回應
            getPrime.then(prime => {
                console.log(prime)
                data = {
                    prime: prime,
                    order: {
                        price: totalPrice,
                        trip: trip,
                        contact: {
                            name: this.querySelector('input[name="name"]').value,
                            email: this.querySelector('input[name="email"]').value,
                            phone: this.querySelector('input[name="phone"]').value,
                        }
                    }
                }
                fetch(orderAPI, {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: new Headers({
                        'Content-Type': 'application/json'
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if(data.data){
                        if(data.data.payment.status == 0){
                            window.location.replace(`/thankyou?number=${data.data.number}`)
                        }else{
                            errorMessage.innerText =  data.data.payment.message
                        }
                    }else{
                        errorMessage.innerText = data.message
                    }
                })
            })
        }
        
        orderForm.addEventListener('submit', sendOrder)
    })
    .catch(e => { // 沒有登入的情況
        //不顯示input表單
        orderForm.classList.remove('show')
    })
}

// 刪除行程
function deleteBooking(e){
    e.preventDefault()
    const bookingId = this.querySelector('input')
    fetch(bookingAPI, {
        method: 'DELETE',
        body: JSON.stringify({id: bookingId.value}),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    })
    .then(res => res.json())
    .then(data => {        
        getBookingData()
    })
}

// 有行程時顯示表單
function hasBooking(){
    //顯示input表單
    orderForm.classList.add('show')
    // 輸出總價格到畫面中
    const totalPriceSpan = orderForm.querySelector('.total-price')
    totalPriceSpan.innerText = totalPrice
    //重新找一次所有booking的表單
    itineraryForms = document.querySelectorAll('form.itinerary')
    itineraryForms.forEach(form => {
        form.addEventListener('submit', deleteBooking)
    })
}

// 沒有任何行程時不顯示表單
function noBooking(){
    orderForm.classList.remove('show')
    const noBooking = document.createElement('h4')
    noBooking.innerText = '目前沒有任何待預定的行程'
    bookingContainer.append(noBooking)
}

getBookingData()




// ⬇︎以下為TapPay付款相關函式

// 訂單付款
TPDirect.setupSDK(20169, 'app_fBb2AL9HJUNdFqUglD9sU2IwMJxcIDeRW5CYrPftEeTHZWvRnERO7tnxNBI0', 'sandbox')

// Display ccv field
TPDirect.card.setup({
    fields: {
        number: {
            element: '#card-number',
            placeholder: '**** **** **** ****'
        },
        expirationDate: {
            element: '#card-expiration-date',
            placeholder: 'MM / YY'
        },
        ccv: {
            element: '#card-ccv',
            placeholder: 'CVV'
        }
    }
})

// listen for TapPay Field
TPDirect.card.onUpdate(function (update) {
    /* Disable / enable submit button depend on update.canGetPrime  */
    /* ============================================================ */
    // update.canGetPrime === true
    //     --> you can call TPDirect.card.getPrime()
    const submitButton = orderForm.querySelector('button[type="submit"]')
    if (update.canGetPrime) {
        submitButton.removeAttribute('disabled')
    } else {
        submitButton.setAttribute('disabled', true)
    }

    /* Change card type display when card type change */
    /* ============================================== */

    // cardTypes = ['visa', 'mastercard', ...]
    // var newType = update.cardType === 'unknown' ? '' : update.cardType
    // $('#cardtype').text(newType)
})

function setNumberFormGroupToError(selector) {
    $(selector).addClass('has-error')
    $(selector).removeClass('has-success')
}

function setNumberFormGroupToSuccess(selector) {
    $(selector).removeClass('has-error')
    $(selector).addClass('has-success')
}

function setNumberFormGroupToNormal(selector) {
    $(selector).removeClass('has-error')
    $(selector).removeClass('has-success')
}

// ios區
function forceBlurIos() {
    if (!isIos()) {
        return
    }
    var input = document.createElement('input')
    input.setAttribute('type', 'text')
    // Insert to active element to ensure scroll lands somewhere relevant
    document.activeElement.prepend(input)
    input.focus()
    input.parentNode.removeChild(input)
}

function isIos() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
// ios區



