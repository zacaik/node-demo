const Router = require("koa-router");
const {
    create
} = require("../controller/user.controller"); // 将具体的处理逻辑抽取到controller中

const {
    verifyUser,
    handlePassword
} = require("../middleware/user.middleware");

const userRouter = new Router({prefix: '/users'});

userRouter.post("/", verifyUser, handlePassword, create);

module.exports = userRouter;