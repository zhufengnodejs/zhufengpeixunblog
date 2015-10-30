var express = require('express');
var router = express.Router();

/**
 * 用户注册
 */
router.get('/reg', function (req, res) {
    res.render('user/reg', {title: '注册'});
});

/**
 * 当填写用户注册信息提交时的处理
 */
router.post('/reg', function (req, res) {
});

/**
 * 显示用户登录表单
 */
router.get('/login', function (req, res) {
    res.render('user/login', {title: '登录'});
});

/**
 * 当填写用户登录信息提交时的处理
 */
router.post('/login', function (req, res) {
});

router.get('/logout', function (req, res) {
});
module.exports = router;
