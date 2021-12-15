const app = require("./app"); // 保持应用入口的单一
const config = require("./app/config");
// const connection = require("./app/database");

app.listen(config.APP_PORT, () => {
    console.log("服务器启动成");
});