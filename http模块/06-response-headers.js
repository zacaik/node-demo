const http = require("http");

const server = http.createServer((req, res) => {
    // res.setHeader("Content-Type", "application/json;charset=utf8"); // 设置响应头
    
    res.writeHead(200, {
        "Content-Type": "text/html;charset=utf8" // 设置客户端对返回数据的处理方式
    })
    res.end("<h2>hello world</h2>");
});

server.listen(8000, "localhost", () => {
  console.log("服务器启动成功");
});
