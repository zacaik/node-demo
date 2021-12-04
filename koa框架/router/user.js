const Router = require("koa-router");

const router = new Router({prefix: "/users"});

router.put("/", (context, next) => {
    context.response.body = "put request";
});

router.get("/", (context, next) => {
    context.response.body = "user lists";
});

module.exports = router;