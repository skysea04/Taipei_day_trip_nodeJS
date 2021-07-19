// fetch景點api

//行程訂購元素
const bookingInfo = document.querySelector('.booking-info')
const imgContainer = bookingInfo.querySelector('.img-container')
const imgIndex = bookingInfo.querySelector('.img-index')
const profile = bookingInfo.querySelector('.profile')
const id = bookingInfo.querySelector('input[name="id"]')
const price = bookingInfo.querySelector('#price')
const morningRadio = bookingInfo.querySelector('input[value="morning"]')
const afternoonRadio = bookingInfo.querySelector('input[value="afternoon"]')

//景點資訊元素
const info = document.querySelector('.info')
const addressContainer = info.querySelector('.address')
const transportContainer = info.querySelector('.transport')


morningRadio.addEventListener('click', ()=>{
    price.innerText = 2000

})
afternoonRadio.addEventListener('click', ()=>{
    price.innerText = 2500
})

// fetch api
const attractionId = document.URL.split('/').slice(-1);
const apiUrl = '/api/attraction/' + attractionId
const fetchAttraction = async () => {
    const result = await fetch(apiUrl)
    const data = await result.json()
    const attr = data.data
    
    //寫入images 和 indexes
    const imgUrls = attr.images
    imgUrls.forEach(imgUrl => {
        const img = document.createElement('img')
        const index = document.createElement('div')
        img.src = imgUrl
        imgContainer.append(img)
        imgIndex.append(index)
    })
    const firstImg = imgContainer.querySelector('img')
    const firstIndex = imgIndex.querySelector('div')
    firstImg.classList.add('show')
    firstIndex.classList.add('show')

    //寫入profile 名稱 類別、捷運站
    const attractionName = document.createElement('h3')
    const category = document.createElement('p')
    attractionName.innerText = attr.name
    if(attr.mrt !== null){
        category.innerText = `${attr.category} at ${attr.mrt}`
    }else{
        category.innerText = attr.category
    }
    profile.insertAdjacentElement('afterbegin', category)
    profile.insertAdjacentElement('afterbegin', attractionName)

    //寫入info 景點資訊
    const description = document.createElement('p')
    const address = document.createElement('p')
    const transport = document.createElement('p')
    description.innerText = attr.description
    address.innerText = attr.address
    transport.innerText = attr.transport
    id.value = attr.id

    info.insertAdjacentElement('afterbegin', description)
    addressContainer.append(address)
    transportContainer.append(transport)
}

fetchAttraction()
    .then(() => {
        // 景點圖片互動輪播功能
        const imgs = document.querySelectorAll('.img-container img')
        const indexBoxes = document.querySelectorAll('.img-index div')
        const preBtn = document.querySelector('#pre-btn')
        const nextBtn = document.querySelector('#next-btn')
        const changeTime = 5000
        
        const imgCount = imgs.length //圖片數量
        let currentImgIndex = 0
        let preImgIndex = imgCount - 1
        let nextImgIndex = currentImgIndex + 1
        
        //找到現在呈現圖片的索引
        function findCurrentImg(){
            for(let i = 0; i < imgCount; i++){
                if(imgs[i].className.includes('show')){
                    currentImgIndex = i
                    preImgIndex = ( i===0 ? imgCount-1 : i-1)
                    nextImgIndex = ( i===imgCount-1 ? 0 : i+1)
                }
            }
        }
        
        //更換圖片
        function changeImg(index){
            imgs[index].classList.toggle('show')
            indexBoxes[index].classList.toggle('show')
            imgs[currentImgIndex].classList.toggle('show')
            indexBoxes[currentImgIndex].classList.toggle('show')
            findCurrentImg()
        }
        
        //上一張
        function showPreImg(){
            changeImg(preImgIndex)
        }
        //下一張
        function showNextImg(){
            changeImg(nextImgIndex)
        }
        //自動播放
        let autoChangeImg = window.setInterval(showNextImg, changeTime)
        
        //上一頁
        preBtn.addEventListener('click',()=>{
            showPreImg()
            clearInterval(autoChangeImg)
            autoChangeImg = window.setInterval(showNextImg, changeTime)
        })
        //下一頁
        nextBtn.addEventListener('click',()=>{
            showNextImg()
            clearInterval(autoChangeImg)
            autoChangeImg = window.setInterval(showNextImg, changeTime)
        })
    })
        


// booking 行程訂購功能
const bookingForm = bookingInfo.querySelector('.booking-form')
const bookingDateInput = bookingForm.querySelector('input[name="date"]')
Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + days)
    return this
}
let minDate = new Date()
minDate.addDays(3)
let dd = minDate.getDate()
let mm = minDate.getMonth()+1 //1月是0!
let yyyy = minDate.getFullYear()
if(dd < 10){
    dd = '0' + dd
}
if(mm < 10){
    mm = '0' + mm
}
minDate = yyyy + '-' + mm + '-' + dd
bookingDateInput.setAttribute('min', minDate)

function bookingItinerary(e){
    e.preventDefault()

    fetch(userAPI)
        .then(res => res.json())
        .then(data => {
            // 有登入
            if(data.data){
                const data = {
                    attractionId : parseInt(attractionId), 
                    date : this.querySelector('input[name="date"]').value,
                    time : this.querySelector('input[name="time"]:checked').value,
                    price : parseInt(this.querySelector('#price').innerText)
                }
                const bookingAPI = '/api/booking'
                fetch(bookingAPI, {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: new Headers({
                        'Content-Type': 'application/json'
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if(data.ok === true){
                        const bookingPage = document.querySelector('.nav-link .booking-page')
                        bookingPage.click()
                    }else{
                        alert(data.message)
                    }
                })
            }else{  // 沒登入
                popUpSignField()
            }
        })
}

bookingForm.addEventListener('submit', bookingItinerary)