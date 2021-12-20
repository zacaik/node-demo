const labelService  = require("../service/label.service");

class LabelController {
    async create (ctx, next) {
        const name = ctx.request.body.name;
        const res = await labelService.create(name);
        ctx.body = res;
    }

    async list (ctx, next) {
        const { limit, offset } = ctx.query;
        const res = await labelService.getLabels(limit, offset);
        ctx.body = res;
    }
}

module.exports = new LabelController();