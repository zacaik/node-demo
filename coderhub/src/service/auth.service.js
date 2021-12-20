// 权限管理模块与数据库的接口
const connection = require("../app/database");

class AuthService {
    async checkPermission (resourceId, userId, resourceName) {
        const statement = `SELECT * FROM ${resourceName} WHERE id = ? AND user_id = ?`;
        const [res] = await connection.execute(statement, [resourceId, userId]);
        return res.length !== 0;
    }
}

module.exports = new AuthService();