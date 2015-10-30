var express = require('express');
var router = express.Router();

router.get('/add', function (req, res) {
    res.render('article/add', { title: '发表文章' });
});

router.post('/add', function (req, res) {
    req.body.user = req.session.user._id;
    new Model('Article')(req.body).save(function(err,article){
        if(err){
            return res.redirect('/articles/add');
        }
        res.redirect('/');//发表文章成功后返回主页
    });

});

module.exports = router;
