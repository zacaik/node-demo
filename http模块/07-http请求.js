const http = require("http");

http.get("http://localhost:8000", (res) => {
    res.setEncoding("utf-8");
    res.on("data", (data) => {
        console.log(data);
    })
});

// http发送post请求
const req = http.request({
    method: 'POST',
    hostname: 'localhost',
    port: 8000,
}, (res) => {
    res.setEncoding("utf-8");

    res.on('data', (data) => {
        console.log(data);
    });

    res.on("end", () => {
        console.log("接收到了请求结果");
    })
});
// post请求需要关闭连接
req.end();