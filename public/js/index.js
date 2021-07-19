// fetch 景點api
const searchForm = document.querySelector('.slogan form')
const main = document.querySelector('main')
const loadingGIF = document.querySelector('.loading')
const footer = document.querySelector('footer')
let page = 0
let keyword = ''
let isFetching = false

//fetch景點函式
const fetchAttractions = async () => {
    isFetching = true
    // model
    if(page===null) return
    let apiUrl = ''
    if(keyword === ''){
        apiUrl = `/api/attractions?page=${page}`
    }else{
        apiUrl = `/api/attractions?page=${page}&keyword=${keyword}`
    }
    const result = await fetch(apiUrl)
    const data = await result.json()
    // view
    if(data["data"]){
        const attractions = data.data
        for(let attr of attractions){
            // 包全部
            const attrContain = document.createElement('div')
            attrContain.classList.add('attraction')
            // 包img
            const imgContain = document.createElement('a')
            imgContain.href = `/attraction/${attr.id}`
            imgContain.classList.add('img-contain')
            // img本人
            const img = document.createElement('img')
            img.src = attr.images[0]
            // 景點名稱
            const name = document.createElement('a')
            name.classList.add('name')
            name.title = attr.name
            name.href = `/attraction/${attr.id}`
            name.innerText = attr.name
            // 包景點資訊
            const info = document.createElement('div')
            info.classList.add('attraction-info')
            // 捷運資訊
            const mrt = document.createElement('p')
            mrt.innerText = attr.mrt
            // 景點類別
            const category = document.createElement('p')
            category.innerText = attr.category
            
            //合併元素
            info.append(mrt, category)
            imgContain.append(img)
            attrContain.append(imgContain, name, info)
            main.append(attrContain)
        }
    }

    page = data['nextPage']
    if(page == null){
        loadingGIF.classList.add('stop-loading')
    }else{
        loadingGIF.classList.remove('stop-loading')
    }
    //當main沒有加入任何值時（沒有任何景點），加入提示字樣
    if(main.innerHTML === ''){
        const noResult = document.createElement('h3')
        noResult.innerText = `找不到符合「${keyword}」的景點`
        noResult.style.color = '#666666'
        main.append(noResult)
        loadingGIF.classList.add('stop-loading')
    }
    isFetching = false
}

//進行keyword搜尋
function fetchSearching(e){
    e.preventDefault()
    keyword = this.querySelector('input').value
    page = 0
    //清除main，重新fetch符合的資料
    main.innerHTML = ''
    fetchAttractions()
        .catch(()=>{
            const errorMessage = document.createElement('h3')
            errorMessage.innerText = data['message']
            errorMessage.style.color = '#666666'
            main.append(errorMessage)
        })
}

//fetch下一頁
function renderNextPage(){
    // 可以之後再用getBoundingClientRect()做看看
    // const mainObject = main.getBoundingClientRect()
    
    //如果在fetching取消這次的fetch 可以避免ec2延遲導致fetch相同api的狀況
    if(isFetching){
        return
    }
    const screenBottom = this.pageYOffset + this.innerHeight
    if(screenBottom > footer.offsetTop-300){
	    fetchAttractions()
    }
}

// 延遲scroll
const debounce = (func, wait=100) => {
    let timeout
    return function executedFunction() {
        const later = () => {
            clearTimeout(timeout)
            func()
        }
        clearTimeout(timeout);
        timeout = setTimeout(later, wait)
    }
}

// 滾動時觸發renderNextPage 
window.addEventListener('scroll', debounce(renderNextPage))

// 進行keword搜尋
searchForm.addEventListener('submit', fetchSearching)

//先執行一次page=0
fetchAttractions()

// 點擊預定行程欄位時，確認是否有登入
const bookingPage = document.querySelector('.booking-page')

function indexSigninCheck(e){
    e.preventDefault()
    fetch(userAPI)
        .then(res => res.json())
        .then(data => {
            if(data.data){
                window.location.assign(bookingPage)
            }else{
                popUpSignField()
            }
        })

}
bookingPage.addEventListener('click', indexSigninCheck)