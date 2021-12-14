const mysql = require("mysql2");

const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    database: 'coderhub',
    user: 'root',
    password: 'li123456QQ',
    connectionLimit: 10
});

const statement = 'SELECT * FROM products WHERE price > ? AND score > ?';

pool.promise().execute(statement, [6000, 7]).then(([res, fields]) => {
    console.log(res);
}).catch((err) => {
    console.log(err);
});