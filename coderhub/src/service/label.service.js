// 标签模块中数据交互的逻辑抽取
const connection = require("../app/database");

class LabelService {
    // 创建标签
    async create (name) {
        const statement = `INSERT INTO label (name) VALUES (?);`;
        const [res] = await connection.execute(statement, [name]);
        return res;
    }

    async findLabelByName (name) {
        const statement = `SELECT * FROM label WHERE name = ?;`;
        const [res] = await connection.execute(statement, [name]);
        return res[0];
    }

    async getLabels (limit, offset) {
        const statement = `
            SELECT * FROM label LIMIT ?, ?;
        `;
        const [res] = await connection.execute(statement, [offset, limit]);
        return res;
    }
}

module.exports = new LabelService();