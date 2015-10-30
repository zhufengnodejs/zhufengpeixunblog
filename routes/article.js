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
    if(req.file){
        req.body.img = path.join('/uploads',req.file.filename);
    }
    var _id = req.body._id;
    if(_id){
        var set = {title:req.body.title,content:req.body.content};
        if(req.file)
            set.img = req.body.img;
        Model('Article').update({_id:_id},{$set:set},function(err,result){
            if(err){
                req.flash('error',err);
                return res.redirect('back');
            }
            req.flash('success', '更新文章成功!');
            res.redirect('/');//注册成功后返回主页
        });
    }else{
        req.body.user = req.session.user._id;
        new Model('Article')(req.body).save(function(err,article){
            if(err){
                req.flash('error',err);
                return res.redirect('/articles/add');
            }
            req.flash('success', '发表文章成功!');
            res.redirect('/');//注册成功后返回主页
        });
    }
});


router.get('/detail/:_id', function (req, res) {
    Model('Article').findOne({_id:req.params._id},function(err,article){
        article.content = markdown.toHTML(article.content);
        res.render('article/detail',{title:'查看文章',article:article});
    });
});


router.get('/delete/:_id', function (req, res) {
    Model('Article').remove({_id:req.params._id},function(err,result){
        if(err){
            req.flash('error',err);
            res.redirect('back');
        }
        req.flash('success', '删除文章成功!');
        res.redirect('/');//注册成功后返回主页
    });
});

router.get('/edit/:_id', function (req, res) {
    Model('Article').findOne({_id:req.params._id},function(err,article){
        res.render('article/add',{title:'编辑文章',article:article});
    });
});

module.exports = router;
