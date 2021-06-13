const http = require("http");

const server = http.createServer((req, res) => {
    console.log(req.headers);
    res.end('hello world');
});

server.listen(8000, "localhost", () => {
  console.log("服务器启动成功");
});
