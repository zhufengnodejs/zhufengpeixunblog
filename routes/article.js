var express = require('express');
var middleware = require('../middleware');
var multer = require('multer');
var path = require('path');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now()+'.'+file.mimetype.slice(file.mimetype.indexOf('/')+1))
    }
})
var upload = multer({ storage:storage})
var router = express.Router();

router.get('/add',middleware.checkLogin, function (req, res) {
    res.render('article/add', { title: '发表文章' });
});

router.post('/add',middleware.checkLogin,upload.single('img'), function (req, res) {
    req.body.user = req.session.user._id;
    if(req.file){
        req.body.img = path.join('/uploads',req.file.filename);
    }
    new Model('Article')(req.body).save(function(err,article){
        if(err){
            req.flash('error', '更新文章失败!');
            return res.redirect('/articles/add');
        }
        req.flash('success', '更新文章成功!');
        res.redirect('/');//发表文章成功后返回主页
    });
});

module.exports = router;
