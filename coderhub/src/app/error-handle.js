const errorTypes = require("../constants/error-types");

const errorHandler = (error, ctx) => {
    let status, message;
    switch (error.message) {
        case errorTypes.NAME_OR_PASSWORD_EMPTY:
            status = 400;
            message = "用户名或密码不能为空";
            break;
        case errorTypes.NAME_DUPLICATE:
            status = 409;
            message = "该用户名已存在";
            break;    
        case errorTypes.NAME_NOT_EXISTS:
            status = 400;
            message = "用户名不存在";
            break;
        case errorTypes.PASSWORD_WRONG:
            status = 400;
            message = "用户名或密码不正确";
            break;         
        case errorTypes.USER_UNAUTHORIZED:
            status = 401;
            message = "请重新登录";
            break;
        case errorTypes.UPDATE_IS_NOT_PERMITTED:
            status = 401;
            message = "该操作不具备权限";
            break;
        default:
            status = 404;
            message = "默认错误";
            break;
    }
    ctx.status = status;
    ctx.body = message;
};

module.exports = errorHandler;