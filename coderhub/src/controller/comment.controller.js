const service = require("../service/comment.service")

class CommentController {
    async create (ctx, next) {
        const { momentId, content } = ctx.request.body;
        const { id } = ctx.user;
        const res = await service.create(momentId, content, id);
        ctx.body = res;
    }

    async reply (ctx, next) {
        const { momentId, content } = ctx.request.body;
        const { commentId } = ctx.params;
        const { id } = ctx.user;
        const res = await service.reply(momentId, commentId, content, id);
        ctx.body = res;
    }

    async update (ctx, next) {
        const { commentId } = ctx.params;
        const { content } = ctx.request.body;
        const res = await service.update(commentId, content);
        ctx.body = res;
    }

    async remove (ctx, next) {
        const { commentId } = ctx.params;
        const res = await service.remove(commentId);
        ctx.body = res;
    }

    async list (ctx, next) {
        const { momentId } = ctx.query;
        const res = await service.getCommentsByMomentId(momentId);
        ctx.body = res;
    }
}
module.exports = new CommentController();