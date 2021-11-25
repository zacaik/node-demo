const express = require('express');

const app = express();

app.get('/home', (req, res, next) => {
    console.log('home path and methods middleware 01');
});

// 开启监听
app.listen(8000, () => {
    console.log("express服务器启动成功")
});