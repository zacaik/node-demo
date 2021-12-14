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

pool.execute(statement, [6000, 7], (err, res) => {
    console.log(res);
});