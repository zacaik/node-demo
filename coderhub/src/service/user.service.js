// 用户管理模块中数据交互的逻辑抽取
const connection = require("../app/database");

class UserService {
    // 用户注册
    async create(user) {
        const {name, password} = user;
        const statement = `INSERT INTO users (name, password) VALUES (?, ?);`;
        const res = await connection.execute(statement, [name, password]);
        return res[0];
    }

    // 查询用户是否存在
    async getUserByName (name) {
        const statement = `SELECT * FROM users WHERE name = ?;`;
        const res = await connection.execute(statement, [name]);
        return res[0]; // 第一个元素才是查询到的数据，也是数组
    }
}

module.exports = new UserService();