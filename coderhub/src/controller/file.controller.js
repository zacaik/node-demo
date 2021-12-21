const { AVATAR_PATH } = require("../constants/file-path");
const fileService = require("../service/file.service");
const userService = require("../service/user.service");
const { APP_HOST, APP_PORT } = require("../app/config");

class FileController {
    async saveImgInfo (ctx, next) {
        const { mimetype, filename, size } = ctx.req.file;
        const { id } = ctx.user;
        await fileService.saveAvatar(filename, mimetype, size, id);

        // 将头像地址保存在数据库中
        const avatarUrl = `${APP_HOST}:${APP_PORT}/users/${id}/avatar`;
        await userService.addAvatarUrl(id, avatarUrl);

        ctx.body = '上传头像成功';
    }
}

module.exports = new FileController();