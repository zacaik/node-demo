const express = require('express');

const app = express();

app.use(express.json()); // 使用内置的函数解析json

// extended含义：
// true: 对urlencoded进行解析时，使用的是第三方库qs
app.use(express.urlencoded({extended: true})); // 解析urlencoded

// app.use((req, res, next) => {
//     if (req.headers["content-type"] === 'application/json') {
//         req.on('data', (data) => {
//             const info = JSON.parse(data.toString());
//             req.body = info;
//         });  
        
//         req.on('end', () => {
//             res.end(`hello ${req.body.username}`);
//             next();
//         });
//     } else {
//         next();
//     }
// });

app.post('/login', (req, res, next) => {
    console.log(req.body);
});

app.post('/product', (req, res, next) => {
    console.log(req.body);
});

// 开启监听
app.listen(8000, () => {
    console.log("express服务器启动成功")
});