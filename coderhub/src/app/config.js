// 项目配置文件，配置数据库相关参数以及公私钥
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config(); // 将.env文件中的配置信息加载到环境变量process中

// console.log(process.env.APP_PORT);

const PRIVATE_KEY = fs.readFileSync(path.resolve(__dirname, "./keys/private.key"));
const PUBLIC_KEY = fs.readFileSync(path.resolve(__dirname, "./keys/public.key"));

module.exports = {
    APP_PORT,
    MYSQL_HOST,
    MYSQL_PORT,
    MYSQL_DATABASE,
    MYSQL_PASSWORD,
    MYSQL_USER,
} = process.env

module.exports.PRIVATE_KEY = PRIVATE_KEY;
module.exports.PUBLIC_KEY = PUBLIC_KEY;