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
}

module.exports = new FileServie();