const errorType = require("../constants/error-types");
const service = require("../service/user.service");
const md5password = require("../utils/password-handle");
const jwt = require("jsonwebtoken");
const { PUBLIC_KEY } = require("../app/config");

// 登录验证
const verifyLogin = async (ctx, next) => {
    const { name, password } = ctx.request.body;

    // 先判断是否为空
    if (!name || !password) {
        const error = new Error(errorType.NAME_OR_PASSWORD_EMPTY);
        return ctx.app.emit("error", error, ctx);
    }

    // 判断用户是否存在
    const res = await service.getUserByName(name);
    const user = res[0];
    if (!user) {
        const error = new Error(errorType.NAME_NOT_EXISTS);
        return ctx.app.emit("error", error, ctx);
    }

    // 判断密码是否匹配
    if (md5password(password) != user.password) {
        const error = new Error(errorType.PASSWORD_WRONG);
        return ctx.app.emit("error", error, ctx);
    }

    ctx.user = user;

    await next();
};

// 验证用户权限
const verifyAuth = async (ctx, next) => {
    try {
        const authorization = ctx.headers.authorization;
        if (!authorization) {
            const err = new Error(errorType.USER_UNAUTHORIZED);
            return ctx.app.emit("error", error, ctx);
        }

        const token = authorization.replace("Bearer ", "");
        const res = jwt.verify(token, PUBLIC_KEY, {
            algorithms: ["RS256"],
        });
        ctx.user = res;
        await next();
    } catch (error) {
        error = new Error(errorType.USER_UNAUTHORIZED);
        ctx.app.emit("error", error, ctx);
    }
};

module.exports = {
    verifyLogin,
    verifyAuth,
}