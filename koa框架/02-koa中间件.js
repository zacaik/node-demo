const Koa = require("koa");

const app = new Koa();

// koa注册中间件只能通过use方法，没有对应的path,methods以及连续注册的方式
app.use((context, next) => {
    if (context.request.url === '/login') {
        if (context.request.method === "GET") {
            context.response.body = "登陆成功";
        }
    } else {
        context.response.body = 'hello koa';
    }
});

app.listen(8000, () => {
    console.log("koa服务器启动成功");
});