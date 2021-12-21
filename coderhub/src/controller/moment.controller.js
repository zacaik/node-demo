const fileService = require("../service/file.service");
const momentService = require("../service/moment.service");
const { PICTURE_PATH } = require("../constants/file-path");
const fs = require("fs");

class MomentController {
    async create (ctx, next) {
        const userId = ctx.user.id;
        const content = ctx.request.body.content;
        const res = await momentService.create(userId, content);
        ctx.body = res;
    }

    async detail(ctx, next) {
        const momentId = ctx.params.momentId;
        const res = await momentService.getMomentById(momentId);
        ctx.body = res;
    }

    async list (ctx, next) {
        const { offset, size } = ctx.query;
        const res = await momentService.getMomentList(offset, size);
        ctx.body = res;
    }

    async update (ctx, next) {
        const { momentId } = ctx.params;
        const { content } = ctx.request.body;
        const res = await momentService.update(content, momentId);
        ctx.body = res;
    }

    async remove (ctx, next) {
        const { momentId } = ctx.params;
        const res = await momentService.remove(momentId);
        ctx.body = res;
    }

    async addLabels (ctx, next) {
        const { momentId } = ctx.params;
        console.log(ctx.labels);
        for (let label of ctx.labels) {
            const isExist = await momentService.hasLabel(momentId, label.id);
            if (!isExist) {
                await momentService.addLabel(momentId, label.id);
            }
        }
        ctx.body = "添加标签成功";
    }

    // 查看动态配图
    async imgInfo (ctx, next) {
        const { filename } = ctx.params;
        const fileinfo = await fileService.getPicInfoByFilename(filename);

        ctx.response.set("content-type", fileinfo.mimetype);
        ctx.body = fs.createReadStream(`${PICTURE_PATH}/${filename}`);
    }
}

module.exports = new MomentController();