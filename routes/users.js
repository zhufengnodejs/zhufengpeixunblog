var express = require('express');
var middleware = require('../middleware');
var router = express.Router();

/**
 * 用户注册
 */
router.get('/reg',middleware.checkNotLogin, function (req, res) {
    res.render('user/reg', {title: '注册'});
});

/**
 * 当填写用户注册信息提交时的处理
 */
router.post('/reg',middleware.checkNotLogin, function (req, res) {
    var user = req.body;
    if(user.password != user.repassword){
        req.flash('error','两次输入的密码不一致');
        return res.redirect('/users/reg');
    }
    delete user.repassword;
    user.password = md5(user.password);
    user.avatar = "https://secure.gravatar.com/avatar/"+md5(user.email)+"?s=48";
    new Model('User')(user).save(function(err,user){
        if(err){
            return res.redirect('/users/reg');
        }
        req.session.user = user;//用户信息存入 session
        res.redirect('/');//注册成功后返回主页
    });
});

/**
 * 显示用户登录表单
 */
router.get('/login',middleware.checkNotLogin, function (req, res) {
    res.render('user/login', {title: '登录'});
});

/**
 * 当填写用户登录信息提交时的处理
 */
router.post('/login',middleware.checkNotLogin, function (req, res) {
    var user = req.body;
    user.password = md5(user.password);
    Model('User').findOne(user,function(err,user){
        if(err){
            return res.redirect('/users/login');
        }
        req.session.user = user;//用户信息存入 session
        res.redirect('/');//注册成功后返回主页
    });
});

router.get('/logout',middleware.checkLogin, function (req, res) {
    req.session.user = null;//用户信息存入 session
    res.redirect('/');//注册成功后返回主页
});


function md5(val){
    return require('crypto').createHash('md5').update(val).digest('hex');
}

module.exports = router;
