const express = require('express');
const userRouter = require("./routers/users");

const app = express();

app.use("/users", userRouter); // 启动路由实例

// 开启监听
app.listen(8000, () => {
    console.log("服务器启动成功");
});