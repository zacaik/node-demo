// 连接数据库
const mysql = require("mysql2");
const config = require("./config");

const connections = mysql.createPool({
    host: config.MYSQL_HOST,
    port: config.MYSQL_PORT,
    password: config.MYSQL_PASSWORD,
    database: config.MYSQL_DATABASE,
    user: config.MYSQL_USER,
});

connections.getConnection((err, con) => {
    con.connect((err) => {
        if (err) { 
            console.log("连接失败");
        } else {
            console.log("连接成功");
        }
    })
});

module.exports = connections.promise();