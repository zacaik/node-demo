const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const multer = require("koa-multer");

const app  = new Koa();
const upload = multer();

app.use(bodyParser()); // json和urlencoded都可以解析

app.use(upload.any()); // 解析form-data

app.use((context, next) => {
    console.log(context.request.body);
    console.log(context.req.body); // req属性对应的是原生http模块的request对象，form-data的数据保存在req对象的body属性中
    context.response.body = "hello koa";
});

app.listen(8000, () => {
    console.log("koa服务器启动成功");
});