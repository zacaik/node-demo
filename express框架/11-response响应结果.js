const express = require('express');

const app = express();

app.get("/login", (req, res, next) => {
    console.log(req.query);
    res.status(204); // 设置响应状态码
    res.type("application/json"); // 设置响应类型
    // res.end(JSON.stringify({name: "why", age: 18})); // 向客户端返回json数据
    res.json(["123", "321"]);
    // res.json({name: "why", age: 18});
});

// 开启监听
app.listen(8000, () => {
    console.log("服务器启动成功");
});