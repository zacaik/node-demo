const fs = require("fs");

// 自动注册路由中间件
const useRoutes = (app) => {
    fs.readdirSync(__dirname).forEach((file) => {
        // 读取当前文件夹的所有文件
        if (file === 'index.js') {
            return;
        }
        const router = require(`./${file}`);
        app.use(router.routes());
        app.use(router.allowedMethods());
    });
};

module.exports = useRoutes;