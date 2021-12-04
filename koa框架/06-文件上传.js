const Koa = require("koa");
const Router = require("koa-router");
const multer = require("koa-multer");
const path = require("path");

const app  = new Koa();
const uploadRouter = new Router({prefix: "/upload"});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

uploadRouter.post("/avatar", upload.single("avatar"), (context, next) => {
    console.log(context.req.file);
    context.response.body = "上传头像成功";
});

app.use(uploadRouter.routes());

app.listen(8000, () => {
    console.log("koa服务器启动成功");
});