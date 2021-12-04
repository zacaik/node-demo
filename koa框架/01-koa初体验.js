const Koa = require("koa"); // 导出的是一个类，所以首字母大写

const app = new Koa();

// koa注册中间件只能通过use方法，没有对应的path,methods以及连续注册的方式
app.use((context, next) => {
    console.log("中间件被执行");
    context.response.body = 'hello koa'; // 返回给客户端的信息
});

app.listen(8000, () => {
    console.log("koa服务器启动成功");
});