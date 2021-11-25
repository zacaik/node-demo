const express = require('express');

const app = express();

app.use((req, res, next) => {
    console.log("common middleware 01");
    res.end("hello");
    next();
});

app.get('/home', (req, res, next) => {
    console.log("home middleware 01"); 
    next();
}, (req, res, next) => {
    console.log("home middleware 02");
});

// 开启监听
app.listen(8000, () => {
    console.log("express服务器启动成功")
});