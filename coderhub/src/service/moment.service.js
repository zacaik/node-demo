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
            JSON_OBJECT('id', users.id, 'name', users.name, 'avatarUrl', users.avatar_url) AS author,
            IF(COUNT(l.id), JSON_ARRAYAGG(
                JSON_OBJECT('id', l.id, 'name', l.name)
            ), NULL) labels,
            (SELECT JSON_ARRAYAGG(CONCAT('http://localhost:8888/moment/images/', file.filename)) FROM file WHERE moment.id = file.moment_id) images
            FROM moment 
            LEFT JOIN users ON moment.user_id = users.id 
            LEFT JOIN moment_label ml ON moment.id = ml.moment_id
            LEFT JOIN label l ON ml.label_id = l.id
            WHERE moment.id = ?;
        `;
        const [res] = await connection.execute(statement, [momentId]);
        return res[0];
    }

    // 获取动态列表
    async getMomentList (offset, size) {
        const statement = `
            SELECT moment.id, moment.content, moment.createAt, moment.updateAt, 
            JSON_OBJECT('id', users.id, 'name', users.name) AS author,
            (SELECT COUNT(*) FROM comment c WHERE c.moment_id = moment.id) commentCount,
            (SELECT COUNT(*) FROM moment_label ml WHERE ml.moment_id = moment.id) labelCount,
            (SELECT JSON_ARRAYAGG(CONCAT('http://localhost:8888/moment/images/', file.filename)) FROM file WHERE moment.id = file.moment_id) images
            FROM moment LEFT JOIN users ON moment.user_id = users.id 
            LIMIT ?, ?;
        `;

        // 一次性查询动态和该动态的评论
        // const statement = `
        // SELECT 
        //     moment.id, moment.content, moment.createAt, moment.updateAt, 
        //     JSON_OBJECT('id', users.id, 'name', users.name) AS user,
        //     JSON_ARRAYAGG(
        //         JSON_OBJECT(
        //             'id', comment.id, 'content', comment.content, 'commentId', comment.comment_id,
        //             'user', JSON_OBJECT('id', cu.id, 'name', cu.name)
        //         )
        //     ) comments
        // FROM moment
        // LEFT JOIN users ON moment.user_id = users.id
        // LEFT JOIN comment ON comment.moment_id = moment.id
        // LEFT JOIN users as cu ON comment.user_id = cu.id
        // WHERE moment.id = 1;
        // `;
        const [res] = await connection.execute(statement, [offset, size]);
        return res;
    }

    // 修改动态内容
    async update (content, momentId) {
        const statement = `UPDATE moment SET content = ? WHERE id = ?;`;
        const [res] = await connection.execute(statement, [content, momentId]);
        return res;
    }

    // 删除动态
    async remove (momentId) {
        const statement = `DELETE FROM moment WHERE id = ?;`;
        const [res] = await connection.execute(statement, [momentId]);
        return res;
    }

    // 判断动态是否以及存在某个标签
    async hasLabel (momentId, labelId) {
        const statement = `SELECT * FROM moment_label WHERE moment_id = ? AND label_id = ?;`;
        const [res] = await connection.execute(statement, [momentId, labelId]);
        return res.length !== 0;
    }

    // 添加动态与标签的对应关系
    async addLabel (momentId, labelId) {
        const statement = `INSERT INTO moment_label (moment_id, label_id) VALUES (?, ?);`;
        const [res] = await connection.execute(statement, [momentId, labelId]);
        return res;
    }
}

module.exports = new MomentService();