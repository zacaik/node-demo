const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    database: 'coderhub',
    user: 'root',
    password: 'li123456QQ',
});

const statement = 'SELECT * FROM products WHERE price > ? AND score > ?';

connection.query(statement, [6000, 7], (err, res, fields) => {
    console.log(res);
    connection.end();
});