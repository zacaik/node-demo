const connection = require("../app/database");

class CommentService {
    async create (momentId, content, userId) {
        const statement = `INSERT INTO comment (content, moment_id, user_id) VALUES (?, ?, ?);`;
        const [res] = await connection.execute(statement, [content, momentId, userId]);
        return res;
    }

    async reply (momentId, commentId, content, userId) {
        const statement = `INSERT INTO comment (content, moment_id, user_id, comment_id) VALUES (?, ?, ?, ?);`;
        const [res] = await connection.execute(statement, [content, momentId, userId, commentId]);
        return res;
    }

    async update (commentId, content) {
        const statement = `UPDATE comment SET content = ? WHERE id = ?;`;
        const [res] = await connection.execute(statement, [content, commentId]);
        return res;
    }

    async remove (commentId) {
        const statement = `DELETE FROM comment WHERE id = ?;`;
        const [res] = await connection.execute(statement, [commentId]);
        return res;
    }

    async getCommentsByMomentId (momentId) {
        const statement = `
            SELECT 
                comment.id, comment.content, comment.comment_id,
                JSON_OBJECT('id', users.id, 'name', users.name) user
            FROM comment 
            LEFT JOIN users ON users.id = comment.user_id
            WHERE moment_id = ?;
        `
        const [res] = await connection.execute(statement, [momentId]);
        return res;
    }
}

module.exports = new CommentService();