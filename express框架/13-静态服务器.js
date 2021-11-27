const express = require('express');

const app = express();

app.use(express.static("./build"));

// 开启监听
app.listen(8000, () => {
    console.log("服务器启动成功");
});