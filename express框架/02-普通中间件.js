const express = require('express');

const app = express();

// 注册中间件
app.use((req, res, next) => {``
    console.log("注册了第一个的中间件");
    res.end('hello'); // 结束当前响应周期，结束周期之后不能再调用res.end
    next(); // 启动下一个中间件
});

app.use((req, res, next) => {``
    console.log("注册了第二个的中间件");
    next();
   //  res.end('hello'); 会报错 因为前面以及结束了响应周期
});

app.use((req, res, next) => {``
    console.log("注册了第三个的中间件");
});

// 开启监听
app.listen(8000, () => {
    console.log("express服务器启动成功")
});