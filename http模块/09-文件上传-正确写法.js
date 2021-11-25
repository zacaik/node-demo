const http = require("http");
const fs = require("fs");
const qs = require("querystring");

const server = http.createServer((req, res) => {
    if (req.url === "/upload") {
        if (req.method === "POST") {
            req.setEncoding('binary'); // 设置处理请求报文的编码格式

            const fullsize = req.headers['content-length'];
            const boundary = req.headers['content-type'].split(';')[1].replace(' boundary=', '');
            let body = '';
            let cursize = 0;

            req.on("data", (data) => {
                cursize += data.length;
                res.write(`文件上传进度：${cursize / fullsize * 100}%\n`);
                body += data;
            });

            // 文件传输完毕后
            req.on("end", () => {
                const payload = qs.parse(body, "\r\n", ":"); // 将数据解析为键值对
                const type = payload["Content-Type"]; // 获取响应类型
                const typeIndex = body.indexOf(type); // 获取响应类型在原响应数据的位置
                const typeLength = type.length;
                let imageData = body.substring(typeIndex + typeLength); // 截取相应类型后的真正的文件数据
                imageData = imageData.replace('\r\n\r\n', ''); // 消除多余的空格
                imageData = imageData.substring(0, imageData.indexOf(`--${boundary}--`)) // 消除数据后的boundary
                fs.writeFile('./foo.jpg', imageData, 'binary', (err) => {
                    console.log("文件上传成功");
                    res.end("文件上传成功");
                });
            });
        }
    }
});

server.listen("8000", () => {
    console.log("文件上传服务启动成功！");
})