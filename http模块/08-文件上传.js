const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
    if (req.url === "/upload") {
        if (req.method === "POST") {
            const fileWriter = fs.createWriteStream("./foo.jpg", { flags: "a+" }); // 开启文件输入流

            // 当接收到数据时，就往文件输入流中写入
            // 等价于req.pipe(fileWriter);
            req.on("data", (data) => {
                fileWriter.write(data);
            });

            // 文件传输完毕后
            req.on("end", () => {
                console.log("文件上传成功");
                res.end("文件上传成功");
            });
        }
    }
});

server.listen("8000", () => {
    console.log("文件上传服务启动成功！");
})