// navbar hamburger操作
const hamburger = document.querySelector('.ham')
const navContainer = document.querySelector('.nav-link')

function toggleNavLink(){
    navContainer.classList.toggle('show')
}

hamburger.addEventListener('click', toggleNavLink)


// popup 相關函式
const toSignBtn = document.querySelector('#to-sign-btn')
const signoutBtn = document.querySelector('#signout-btn')
const signBg = document.querySelector('.sign-bg')
const signCloseBtns = signBg.querySelectorAll('.close-btn')
const signContainers = document.querySelectorAll('.sign-container')
const memberLink = document.querySelector('.member-page')

//秀出登入、註冊欄位
function popUpSignField(){
    signBg.classList.add('pop-up')
    toSignBtn.classList.add('active')
}
// 離開登入、註冊欄位
function cancelPopUpSignField(){
    signBg.classList.remove('pop-up')
    toSignBtn.classList.remove('active')
}
//變換登入、註冊欄位
function changeSignContainer(){
    signContainers.forEach(container=>{
        container.classList.toggle('show')
    })
}

toSignBtn.addEventListener('click', popUpSignField)

signCloseBtns.forEach(btn => {
    btn.addEventListener('click',cancelPopUpSignField)
})

//點選旁邊透明部分，也會離開登入｜註冊欄位
signBg.addEventListener('click', e => {
    if(e.path[0] === signBg){
        cancelPopUpSignField()
    }
})

signContainers.forEach(container => {
    const changeBtn = container.querySelector('.change-sign')
    changeBtn.addEventListener('click', changeSignContainer)
})


// 登入、註冊功能
const signupForm = document.querySelector('#signup')
const signinForm = document.querySelector('#signin')
const userAPI = '/api/user'

// 註冊
function signup(e){
    e.preventDefault()
    const data = {
        name : this.querySelector('input[name="name"]').value,
        email : this.querySelector('input[name="email"]').value,
        password : this.querySelector('input[name="password"]').value 
    }
    fetch(userAPI, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
    })
    .then(res => res.json())
    //看response結果
    .then(data => {
        const message = this.querySelector('.message')
        if(data.ok){
            message.innerText = '註冊成功'
        }else{
            message.innerText = data.message
        }
    })
}


// 登入
function signin(e){
    e.preventDefault()
    const data = {
        email : this.querySelector('input[name="email"]').value,
        password : this.querySelector('input[name="password"]').value 
    }
    fetch(userAPI, {
        method: 'PATCH',
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers: new Headers({
          'Content-Type': 'application/json'
        })
    })
    .then(res => res.json())
    .then(data => {
        //如果有成功登入，回到原本頁面並將「註冊｜登入」按鈕改為「登出」按鈕
        if(data.ok === true){
            cancelPopUpSignField()
            signinCheck()
            if(navContainer.classList.contains('show')){
                toggleNavLink()
            }
            toSignBtn.classList.remove('show')
            signoutBtn.classList.add('show')
            //頁面更新用
            try{ getUserData() }catch(e){}
            try{ getBookingData() }catch(e){}
            try{ getOrderData() }catch(e){}
            try{ fetchOrderAPI() }catch(e){}
        }else{
            const message = this.querySelector('.message')
            message.innerText = data.message
        }
    })
}

signupForm.addEventListener('submit', signup)
signinForm.addEventListener('submit', signin)


//登出
function signout(){
    fetch(userAPI, {
        method: 'DELETE'
    })
    .then(() => {
        signinCheck()
        //頁面更新用
        try{ getUserData() }catch(e){}
        try{ getBookingData() }catch(e){}
        try{ getOrderData() }catch(e){}
        try{ fetchOrderAPI() }catch(e){}
    })
}
signoutBtn.addEventListener('click', signout)

//檢查是否有登入，若get user api有資料，秀出signoutBtn
function signinCheck(){
    fetch(userAPI)
        .then(res => res.json())
        .then(data => {
            if(data.data){
                toSignBtn.classList.remove('show')
                signoutBtn.classList.add('show')
                memberLink.classList.add('show')
            }else{
                toSignBtn.classList.add('show')
                signoutBtn.classList.remove('show')
                memberLink.classList.remove('show')
            }
        })
}
//進入頁面後先檢查使用者有沒有登入
signinCheck()