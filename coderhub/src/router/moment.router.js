const Router = require("koa-router");
const {
    verifyAuth,
    verifyPermission,
} = require("../middleware/auth.middleware");

const {
    create,
    detail,
    list,
    update,
    remove,
    addLabels,
} = require("../controller/moment.controller");

const { verifyLabelExists } = require("../middleware/label.middleware");

const momentRouter = new Router({prefix: "/moment"});

momentRouter.post("/", verifyAuth, create);
momentRouter.get("/", list); // 获取多个动态
momentRouter.get("/:momentId", detail); // 获取指定动态的内容
momentRouter.patch("/:momentId", verifyAuth, verifyPermission, update); // 修改动态的内容
momentRouter.delete("/:momentId", verifyAuth, verifyPermission, remove); // 删除动态
momentRouter.post("/:momentId/labels", verifyAuth, verifyLabelExists, addLabels); // 给动态增加标签


module.exports = momentRouter;