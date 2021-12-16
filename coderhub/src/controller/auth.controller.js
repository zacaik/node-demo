class AuthController {
    async login (ctx, next) {
        const { name } = ctx.request.body;
        ctx.body = `登陆成功, welcom ${name}`;
    }
}

module.exports = new AuthController();