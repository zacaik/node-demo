const express = require('express');
const morgan = require("morgan");
const fs = require("fs");

const app = express();

const writeStream = fs.createWriteStream("./logs/access.log", {
    flags: "a+" // 表示每次都在文件末尾开始写，即增加
})

app.use(morgan("combined", {stream: writeStream})); // combined参数用于设置日志保存的格式，stream用于设置日志的写入

app.get("/home", (req, res) => {
    res.end("hello morgan");
});

// 开启监听
app.listen(8000, () => {
    console.log("服务器启动成功");
});