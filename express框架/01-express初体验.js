const express = require('express'); // 实际导出的是名为createApplication的函数

const app = express();

// 监听默认路径
app.get('/', (req, res, next) => {
    res.end('hello motherfucker');
});

app.post('/', (req, res, next) => {
    res.end('hello motherfucker');
});

// 开启监听
app.listen(8000, () => {
    console.log("express服务器启动成功")
});