var express = require('express');
var router = express.Router();
markdown = require('markdown').markdown;

router.get('/', function(req, res, next) {
  res.redirect('/articles/list/1/2');
});

module.exports = router;
