const crypto = require("crypto");

const md5password = (password) => {
    const md5 = crypto.createHash("md5");
    const res = md5.update(password).digest('hex'); // 将密码加密并转换成16进制
    return res;
};

module.exports = md5password;