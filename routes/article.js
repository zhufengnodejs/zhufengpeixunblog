var express = require('express');
var middleware = require('../middleware');
var multer = require('multer');
var path = require('path');
var async = require('async');
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

router.get('/list/:pageNum/:pageSize',function(req, res, next) {
    var pageNum = req.params.pageNum&&req.params.pageNum>0?parseInt(req.params.pageNum):1;
    var pageSize =req.params.pageSize&&req.params.pageSize>0?parseInt(req.params.pageSize):2;
    var query = {};
    var searchBtn = req.query.searchBtn;
    var keyword = req.query.keyword;
    if(searchBtn){
        req.session.keyword = keyword;
    }
    if(req.session.keyword){
        query['title'] = new RegExp(req.session.keyword,"i");
    }

    Model('Article').count(query,function(err,count){
        Model('Article').find(query).sort({createAt:-1}).skip((pageNum-1)*pageSize).limit(pageSize).populate('user').exec(function(err,articles){
            if(articles)
                articles.forEach(function (article) {
                    if(article.content)
                        article.content = markdown.toHTML(article.content);

                });
            res.render('index',{
                title:'主页',
                pageNum:pageNum,
                pageSize:pageSize,
                keyword:req.session.keyword,
                totalPage:Math.ceil(count/pageSize),
                articles:articles
            });
        });
    });

});

router.get('/add',middleware.checkLogin, function (req, res) {
    res.render('article/add', { title: '发表文章',article:{} });
});

router.post('/add', upload.single('img'),function (req, res) {
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
        delete req.body._id;
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
    async.parallel([function(callback){
        Model('Article').findOne({_id:req.params._id}).populate('user').populate('comments.user').exec(function(err,article){
                article.content = markdown.toHTML(article.content);
                callback(err,article);
        });
    },function(callback){
        Model('Article').update({_id:req.params._id},{$inc:{pv:1}},callback);
    }],function(err,result){
        if(err){
            req.flash('error',err);
            res.redirect('back');
        }
        res.render('article/detail',{title:'查看文章',article:result[0]});
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

router.post('/comment',middleware.checkLogin, function (req, res) {
   var user = req.session.user;
   Model('Article').update({_id:req.body._id},{$push:{comments:{user:user._id,content:req.body.content}}},function(err,result){
        if(err){
            req.flash('error',err);
            return res.redirect('back');
        }
        req.flash('success', '评论成功!');
        res.redirect('back');
   });

});
module.exports = router;
