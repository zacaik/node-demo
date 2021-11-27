const express = require('express');

const app = express();

const USERNAME_NOT_EXSIST = 'USERNAME_NOT_EXSIST';

app.post("/login", (req, res, next) => {
    const isLogin = false;
    if (isLogin) {
        res.json("登陆成功");
    } else {
        // res.status(400);
        // res.json("用户名或密码错误");
        next(new Error(USERNAME_NOT_EXSIST)); // 将错误向下传递
    }
});

// 统一错误处理
// 回调函数跟4个参数表示错误处理
app.use((err, req, res, next) => {
    let status = 400;
    let message = "";
    switch (err.message) {
        case USERNAME_NOT_EXSIST:
            message = "user not exsists";
            break;
        default:
            message = "not found";
    }

    res.status(status);
    res.json({
        errCode: status,
        errMessage: message,
    });
});

// 开启监听
app.listen(8000, () => {
    console.log("服务器启动成功");
});