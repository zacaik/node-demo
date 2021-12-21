const fileService = require("../service/file.service");
const userService = require("../service/user.service");
const { APP_HOST, APP_PORT } = require("../app/config");

class FileController {
    async saveAvtarInfo (ctx, next) {
        const { mimetype, filename, size } = ctx.req.file;
        const { id } = ctx.user;
        await fileService.saveAvatar(filename, mimetype, size, id);

        // 将头像地址保存在数据库中
        const avatarUrl = `${APP_HOST}:${APP_PORT}/users/${id}/avatar`;
        await userService.addAvatarUrl(id, avatarUrl);

        ctx.body = '上传头像成功';
    }

    async savePicInfo (ctx, next) {
        const files = ctx.req.files;
        const { id } = ctx.user;
        const { momentId } = ctx.query;

        // 将配图信息保存在数据库中
        for (let file of files) {
            const { filename, mimetype, size } = file;
            await fileService.savePicture(filename, mimetype, size, id, momentId);
        }
        ctx.body = '动态配图上传完成';
    }
}

module.exports = new FileController();