const Router = require("koa-router");
const {
    verifyAuth
} = require("../middleware/auth.middleware");

const {
    create,
    detail,
    list,
} = require("../controller/moment.controller");

const momentRouter = new Router({prefix: "/moment"});

momentRouter.post("/", verifyAuth, create);
momentRouter.get("/", list); // 获取多个动态
momentRouter.get("/:momentId", detail); // 获取指定动态的内容


module.exports = momentRouter;