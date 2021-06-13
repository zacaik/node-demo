const http = require('http');
const url = require('url');
const qs = require('querystring');

const server = http.createServer((req, res) => {
    // req对象描述了客户端发来的请求信息
    console.log(req.url);
    // console.log(url.parse(req.url));
    const { query } = url.parse(req.url);
    console.log(query);
    const { username, password } = qs.parse(query);
    console.log(username);
    console.log(password);
    // console.log(req.method);
    // console.log(req.headers);
    res.end("hello world");
});

server.listen(8000, 'localhost', () => {
    console.log('服务器启动成功');
});