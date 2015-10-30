var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  Model('Article').find({}).populate('user').exec(function(err,articles){
    res.render('index', {title: '主页',articles:articles});
  });
});

module.exports = router;
