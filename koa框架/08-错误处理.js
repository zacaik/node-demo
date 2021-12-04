const Koa = require("koa");

const app  = new Koa();

app.use((context, next) => {
    const isLogin = false;
    if (!isLogin) {
        context.app.emit("error", new Error("用户未登录"), context);
    }
});

// 监听错误
app.on("error", (err, context) => {
    context.status = 401;
    context.body = err.message;
});

app.listen(8000, () => {
    console.log("koa服务器启动成功");
});