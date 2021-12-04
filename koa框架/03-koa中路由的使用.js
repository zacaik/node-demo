const Koa = require("koa");

const app = new Koa();

const userRouter = require("./router/user");

app.use(userRouter.routes());
app.use(userRouter.allowedMethods()); // 自动判断客户端的请求方法是否支持

app.listen(8000, () => {
    console.log("koa服务器启动成功");
});