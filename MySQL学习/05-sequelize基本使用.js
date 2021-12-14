const { Sequelize } = require("sequelize");

const sequelize = new Sequelize('coderhub', 'root', 'li123456QQ', {
    host: 'localhost',
    dialect: 'mysql',
});

sequelize.authenticate().then(() => {
    console.log("success");
})