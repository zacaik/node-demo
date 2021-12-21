// 文件上传相关接口
const Router = require("koa-router");
const { avatarHandler, pictureHandler } = require("../middleware/file.middleware");
const { verifyAuth } = require("../middleware/auth.middleware");
const { saveAvtarInfo, savePicInfo } = require("../controller/file.controller");

const fileRouter = new Router({prefix: '/upload'});

fileRouter.post("/avatar", verifyAuth, avatarHandler, saveAvtarInfo);
fileRouter.post("/picture", verifyAuth, pictureHandler, savePicInfo); // 动态添加配图接口

module.exports = fileRouter;