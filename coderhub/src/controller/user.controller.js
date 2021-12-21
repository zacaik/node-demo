// 用户管理模块的具体处理逻辑
const userService = require("../service/user.service");
const fileService = require("../service/file.service");
const fs = require("fs");
const { AVATAR_PATH } = require("../constants/file-path");

class UserController {
    // 用户注册
    async create (ctx, next) {
        const user = ctx.request.body;
        const res = await userService.create(user);
        ctx.body = res;
    }

    // 获取用户头像
    async getAvatar (ctx, next) {
        const { userId } = ctx.params;
        const avatarInfo = await fileService.getAvatarByUserId(userId);

        ctx.response.set("content-type", avatarInfo.mimetype);
        ctx.body = fs.createReadStream(`${AVATAR_PATH}/${avatarInfo.filename}`);
    }
}

module.exports = new UserController();