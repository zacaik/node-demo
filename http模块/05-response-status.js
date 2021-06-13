const http = require("http");

const server = http.createServer((req, res) => {
    // res.statusCode = 400; // 设置响应状态码
    res.writeHead(400);
    res.end('hello world');
});

server.listen(8000, "localhost", () => {
  console.log("服务器启动成功");
});
