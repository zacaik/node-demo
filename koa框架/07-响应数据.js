const Koa = require("koa");

const app  = new Koa();

app.use((context, next) => {
    // 响应json数据
    context.response.body = {
        "name": "jr",
        "age": 21,
    }

    context.status = 201; // 设置响应状态码
});

app.listen(8000, () => {
    console.log("koa服务器启动成功");
});