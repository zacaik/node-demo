const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    database: 'coderhub',
    user: 'root',
    password: 'li123456QQ',
});

const statement = 'SELECT * FROM products WHERE price > 6000';

connection.query(statement, (err, res, fields) => {
    console.log(res);
    connection.end();
});