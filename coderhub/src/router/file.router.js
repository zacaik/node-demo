// 文件上传相关接口
const Router = require("koa-router");
const { avatarHandler } = require("../middleware/file.middleware");
const { verifyAuth } = require("../middleware/auth.middleware");
const { saveImgInfo } = require("../controller/file.controller");

const fileRouter = new Router({prefix: '/upload'});

fileRouter.post("/avatar", verifyAuth, avatarHandler, saveImgInfo);

module.exports = fileRouter;