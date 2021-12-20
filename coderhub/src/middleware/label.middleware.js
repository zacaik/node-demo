const service = require("../service/label.service");

// 判断给当前动态添加的标签是否以及创建
const verifyLabelExists = async (ctx, next) => {
    const { labels } = ctx.request.body;
    const newLabels = [];
    for (let name of labels) {
        const findRes = await service.findLabelByName(name);
        console.log(findRes);
        const label = { name };
        if (!findRes) {
            // 如果标签还没有创建
            const createRes = await service.create(name);
            label.id = createRes.insertId;
        } else {
            label.id = findRes.id;
        }
        newLabels.push(label);
    }
    console.log(newLabels);
    ctx.labels = newLabels;
    await next();
};

module.exports = {
    verifyLabelExists,
};