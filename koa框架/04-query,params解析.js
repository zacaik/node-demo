const Koa = require("koa");
const Router = require("koa-router");

const app  = new Koa();
const userRouter = new Router({prefix: "/users"});

userRouter.get("/:id", (context, next) => {
    console.log(context.request.params);
    console.log(context.request.query);
});

// app.use((context, next) => {
//     console.log(context.request.url);
//     console.log(context.request.query);
//     console.log(context.request.params);
//     context.response.body = "hello koa";
// });

app.use(userRouter.routes());

app.listen(8000, () => {
    console.log("koa服务器启动成功");
});