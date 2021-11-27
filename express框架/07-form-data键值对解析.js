const express = require('express');
const multer = require("multer");

const app = express();

const upload = multer();

// app.use(upload.any()); // 接收一切上传的文件, 不建议作为全局中间件使用。因为有可能会被恶意上传

app.post("/login", upload.any(), (req, res, next) =>{
    console.log(req.body);
    res.end("用户登陆成功");
});

// 开启监听
app.listen(8000, () => {
    console.log("form-data解析服务器启动成功");
});