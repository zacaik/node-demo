const express = require('express');

const app = express();

app.get("/products/:id", (req, res, next) => {
    console.log(req.params);
    res.end("商品的详情数据");
});

app.get("/login", (req, res, next) => {
    console.log(req.query);
    res.end("登陆成功");
});

// 开启监听
app.listen(8000, () => {
    console.log("服务器启动成功");
});