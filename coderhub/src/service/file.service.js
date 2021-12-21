const connection = require("../app/database");

class FileServie {
    async saveAvatar (filename, mimetype, size, userId) {
        const statement = `INSERT INTO avatar (filename, mimetype, size, user_id) VALUES (?, ?, ?, ?);`;
        const [res] = await connection.execute(statement, [filename, mimetype, size, userId]);
        return res;
    }

    async getAvatarByUserId (id) {
        const statement = `SELECT * FROM avatar WHERE user_id = ?;`;
        const [res] = await connection.execute(statement, [id]);
        return res[0];
    }

    // 保存配图信息
    async savePicture(filename, mimetype, size, userId, momentId) {
        const statement = `INSERT INTO file (filename, mimetype, size, user_id, moment_id) VALUES (?, ?, ?, ?, ?);`;
        const [res] = await connection.execute(statement, [filename, mimetype, size, userId, momentId]);
        return res;
    }

    // 查询动态配图信息
    async getPicInfoByFilename (filename) {
        const statement = `SELECT * FROM file WHERE filename = ?;`;
        const [res] = await connection.execute(statement, [filename]);
        return res[0];
    }
}

module.exports = new FileServie();