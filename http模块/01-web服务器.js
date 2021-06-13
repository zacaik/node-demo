const http = require('http');

const server = http.createServer((req, res) => {
    res.end('hello world');
});

server.listen(8000, '127.0.0.1', () => {
    console.log('服务器启动成功');
});

const server2 = http.createServer((req, res) => {
    res.end('hello2');
});

//等价于：const server2 = new http.Server((req, res) => {});

// server2.listen(8001, () => {
//     console.log('备用服务器启动成功');
// })

//函数重载 listen方法的参数为可选
// server2.listen(() => {
//     console.log(server2.address().port);// 获取当前随机分配的端口号
// });

// 0.0.0.0为默认路由的ip地址，本机对本机的IP地址的请求和回环请求都可以到达0.0.0.0
// 如果不设置指定ip地址，会默认设置为0.0.0.0
server2.listen(8001, '0.0.0.0', () => {
    console.log('启动成功');
})