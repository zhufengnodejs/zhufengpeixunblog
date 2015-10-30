var express = require('express');
var router = express.Router();

router.get('/add', function (req, res) {
    res.render('article/add', { title: '发表文章' });
});

router.post('/add', function (req, res) {

});

module.exports = router;
