const express = require('express');

const router = express.Router(); // 创建路由实例

router.get("/", (req, res, next) => {
    res.json(["why", "kobe"]);
});

router.get("/:id", (req, res, next) => {
    res.json(`${req.params.id}用户的信息`);
});

router.post("/", (req, res, next) => {
    res.json("创建用户成功");
});

module.exports = router;