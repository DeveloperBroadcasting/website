var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var admin = require('./routes/admin');

var MongoClient = require('./mongoClient');
var ObjectID = require('mongodb').ObjectID;

// Connect to MongoDB
var url = 'mongodb://localhost:27017/blog';
var Users;
MongoClient.init(url, function(err, db) {
  if(!err) {
    console.log('MongoClient connected to: ', url);
    Users = db.collection('users');
  }
})

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  genid: function(req) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 32; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  },
  secret: 'lulzAndStuff9903'
}))
app.use(function(req, res, next) {
  if(req.session && req.session._id) {
    Users.findOne({
      _id: ObjectID(req.session._id)
    }, function(err, user) {
      req.user = user;
      next();
    })
    return;
  }
  next();
})

app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', admin);
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
