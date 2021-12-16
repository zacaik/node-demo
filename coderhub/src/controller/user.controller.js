// 用户管理模块的具体处理逻辑
const service = require("../service/user.service");

class UserController {
    // 用户注册
    async create (ctx, next) {
        const user = ctx.request.body;

        const res = await service.create(user);

        ctx.body = res;
    }
}

module.exports = new UserController();