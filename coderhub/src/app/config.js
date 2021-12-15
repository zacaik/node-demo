const dotenv = require("dotenv");

dotenv.config(); // 将.env文件中的配置信息加载到环境变量process中

// console.log(process.env.APP_PORT);

module.exports = {
    APP_PORT,
    MYSQL_HOST,
    MYSQL_PORT,
    MYSQL_DATABASE,
    MYSQL_PASSWORD,
    MYSQL_USER,
} = process.env