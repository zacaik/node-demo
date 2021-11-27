const express = require('express');
const multer = require("multer");

const path = require("path");

const app = express();

// 设置文件存储方式
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads"); // 设置文件保存路径
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // 设置文件名
    }
});

const upload = multer({
    // dest: './uploads/'
    storage
});

// app.post("/upload", upload.single("file"), (req, res, next) => {
//     console.log(req.file); // 如果使用了upload.any,文件信息则是保存在files属性中，否则保存在file属性中
//     res.end("文件上传成功");
// });

// 处理多个文件上传用arry
app.post("/upload", upload.array("file"), (req, res, next) => {
    console.log(req.files); 
    res.end("文件上传成功");
});

// 开启监听
app.listen(8000, () => {
    console.log("form-data解析服务器启动成功");
});