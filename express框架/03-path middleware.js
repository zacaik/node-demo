const express = require('express');

const app = express();

// 路径匹配，不同请求方式都可以匹配上
app.use('/home', (req, res, next) => {
    console.log("path middleware 01");
    res.end('hello path middleware'); 
    next();
});

app.use('/home', (req, res, next) => {
    console.log("path middleware 02");
});

// 开启监听
app.listen(8000, () => {
    console.log("express服务器启动成功")
});