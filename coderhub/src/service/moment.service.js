// 动态管理模块中与数据库的相关接口
const connection = require("../app/database");

class MomentService {
    // 发布新的动态
    async create(userId, content) {
        const statement = `INSERT INTO moment (content, user_id) VALUES (?, ?);`;
        const [res] = await connection.execute(statement, [content, userId]);
        return res;
    }

    // 查询指定动态的内容
    async getMomentById (momentId) {
        const statement = `
            SELECT moment.id, moment.content, moment.createAt, moment.updateAt, 
            JSON_OBJECT('id', users.id, 'name', users.name) AS author
            FROM moment LEFT JOIN users ON moment.user_id = users.id WHERE moment.id = 1;
        `;
        const [res] = await connection.execute(statement, [momentId]);
        return res[0];
    }

    // 获取动态列表
    async getMomentList (offset, size) {
        const statement = `
            SELECT moment.id, moment.content, moment.createAt, moment.updateAt, 
            JSON_OBJECT('id', users.id, 'name', users.name) AS author
            FROM moment LEFT JOIN users ON moment.user_id = users.id 
            LIMIT ?, ?;
        `;
        const [res] = await connection.execute(statement, [offset, size]);
        return res;
    }
}

module.exports = new MomentService();