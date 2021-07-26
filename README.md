# [台北一日遊](https://skyseatravel.site/) 旅遊店商專案

本專案以台北資料大平台之台北景點作為資料根據，建置台北一日遊的導覽電商網站，內容包含：
1. 首頁之景點瀏覽、搜尋。
2. 個別景點資訊分頁，預定行程購物車。
3. 與TapPay金流服務進行串接，可用測試信用卡進行付款與退款功能。

## Demo
點擊該網址即可前往台北一日遊網站 : https://skyseatravel.site/

Test User : test1@test.com</br>
Password : 123

Credit Card : 4242-4242-4242-4242</br>
Date : 01/23</br>
CVV : 123

亦可在註冊欄位建立自己的帳號使用網站功能

## 使用技術
* Framework : Node.js Express.js
* RESTful API架構實踐專案功能
* 原生HTML+CSS完成RWD網頁
* 使用index加速MySQL查詢效率
* 結合TapPay SDK開發購物車系統
* 專案建構於EC2
* 申請SSL憑證實踐HTTPS

## 功能介紹

### 首頁瀏覽

* 滾輪往下滑，可以閱覽所有景點資訊(1次重新列出12筆新景點)，也可以透過關鍵字搜尋景點標題

  ![image](https://user-images.githubusercontent.com/73434165/121943692-6ba0a780-cd84-11eb-8f04-32423d8a6c28.png)

### 帳號管理

* 使用者可以註冊、登入、登出網站系統

  ![image](https://user-images.githubusercontent.com/73434165/121942693-5b3bfd00-cd83-11eb-864b-a6196c0b8372.png)

* 使用者可以進入各個景點分頁，訂購行程、刪除購物車行程，並在預定行程頁面進行付款

  ![image](https://user-images.githubusercontent.com/73434165/121942891-93434000-cd83-11eb-9651-d4cfcf452185.png)

* 使用者可以在會員系統查看過去的所有歷史訂單，並點選標題超連結進入各個訂購分頁，以及在會員系統進行退款

  ![image](https://user-images.githubusercontent.com/73434165/121943303-051b8980-cd84-11eb-8c63-a664e4179354.png)



