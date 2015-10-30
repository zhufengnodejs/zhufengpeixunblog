var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var settings = require('./settings');
var routes = require('./routes/index');
var users = require('./routes/users');
var articles = require('./routes/article');
require('./db');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});
app.use(logger('dev',{stream: accessLog}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
app.use(session({
  secret: settings.cookieSecret,//secret 用来防止篡改 cookie
  key: settings.db,//cookie name cookie 的名字
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  resave:true,
  saveUninitialized:true,
  store: new MongoStore({
    db: settings.db,
    host: settings.host,
    port: settings.port
  })
}));
app.use(flash());

app.use(function(req,res,next){
  res.locals.keyword = req.session.keyword;
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success').toString();
  res.locals.error = req.flash('error').toString();
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/articles', articles);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render("404");
});

// error handlers

app.use(function (err, req, res, next) {
  var meta = '[' + new Date() + '] ' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  //res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
