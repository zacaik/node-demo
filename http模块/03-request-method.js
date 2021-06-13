const http = require("http");
const url = require("url");

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url);

  if (req.method === "POST") {
    // 获取data中的数据
    req.setEncoding("utf-8"); // 设置接受数据的编码格式
    req.on("data", (data) => {
      //   console.log(data.toString()); // 如果没有设置编码格式，需要将buffer转换为字符串
      const { username, password } = JSON.parse(data);
      console.log(username);
      console.log(password);
    });
  }

  res.end("hello world");
});

server.listen(8000, "localhost", () => {
  console.log("服务器启动成功");
});
