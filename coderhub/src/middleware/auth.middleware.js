const errorType = require("../constants/error-types");
const userService = require("../service/user.service");
const authService = require("../service/auth.service");
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
    const res = await userService.getUserByName(name);
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

// 验证用户登录权限
const verifyAuth = async (ctx, next) => {
    try {
        const authorization = ctx.headers.authorization;
        if (!authorization) {
            const err = new Error(errorType.USER_UNAUTHORIZED);
            return ctx.app.emit("error", err, ctx);
        }

        const token = authorization.replace("Bearer ", "");
        const res = jwt.verify(token, PUBLIC_KEY, {
            algorithms: ["RS256"],
        });
        console.log(res);
        ctx.user = res;
        await next();
    } catch (error) {
        console.log(error);
        error = new Error(errorType.USER_UNAUTHORIZED);
        ctx.app.emit("error", error, ctx);
    }
};

// 验证修改操作的权限
const verifyPermission = async (ctx, next) => {
    const resourceName = Object.keys(ctx.params)[0].replace("Id", "");
    const resourceId = ctx.params[resourceName + "Id"];
    const { id } = ctx.user;
    const isPermitted = await authService.checkPermission(resourceId, id, resourceName);
    if (isPermitted) {
        await next();
    } else {
        const error = new Error(errorType.UPDATE_IS_NOT_PERMITTED);
        return ctx.app.emit("error", error, ctx);
    }
}

module.exports = {
    verifyLogin,
    verifyAuth,
    verifyPermission,
}