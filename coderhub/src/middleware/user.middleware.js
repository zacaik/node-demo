// 用户管理模块的中间件
const errorType = require("../constants/error-types");
const service = require("../service/user.service");
const md5password = require("../utils/password-handle")

// 判断用户名和密码的合法性
const verifyUser = async (ctx, next) => {
    const { name, password } = ctx.request.body;
    // 判断用户名和密码是否为空
    if (!name || !password) {
        const error = new Error(errorType.NAME_OR_PASSWORD_EMPTY);
        return ctx.app.emit("error", error, ctx);
    }

    // 判断用户名是否被注册过
    const res = await service.getUserByName(name);
    if (res.length) {
        const error = new Error(errorType.NAME_DUPLICATE);
        return ctx.app.emit("error", error, ctx);
    }

    await next(); // 因为下一个中间件会执行异步操作，为了使得下一个中间件执行完之后再返回结果，所以加上await
};

// 密码加密
const handlePassword = async (ctx, next) => {
    const { password } = ctx.request.body;
    ctx.request.body.password = md5password(password);
    await next();
};

module.exports = {
    verifyUser,
    handlePassword,
}