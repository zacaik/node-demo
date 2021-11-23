const http = require("http");
const fs = require("fs");
const qs = require("querystring");

const server = http.createServer((req, res) => {
    if (req.url === "/upload") {
        if (req.method === "POST") {
            let body = '';
            console.log(req.headers);
            const boundary = req.headers['content-type'].split(';')[1].replace(' boundary=', '');
            console.log(boundary);

            req.on("data", (data) => {
                body += data;
            });

            // 文件传输完毕后
            req.on("end", () => {
                const payload = qs.parse(body, "\r\n", ":"); // 将数据解析为键值对
                console.log(payload);
                const type = payload["Content-Type"]; // 获取响应类型
                console.log(type);
                const typeIndex = body.indexOf(type); // 获取响应类型在原响应数据的位置
                const typeLength = type.length;
                let imageData = body.substring(typeIndex + typeLength); // 截取相应类型后的真正的文件数据
                imageData = imageData.replace('\r\n\r\n', ''); // 消除多余的空格

                console.log("文件上传成功");
                res.end("文件上传成功");
            });
        }
    }
});

server.listen("8000", () => {
    console.log("文件上传服务启动成功！");
})