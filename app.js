var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const config = require('./utils/config')
const { expressjwt } = require('express-jwt')
const { verifyToken } = require('./utils/token')
let { unless } = require('express-unless')


var app = express();
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  next()
})

app.use(function (req, res, next) {
  let token = req.headers['authorization']
  if (token == undefined) {
    return next()
  } else {
    try {
      req.auth = verifyToken(token)
      console.log(req.auth)
      return next()
    } catch (err) {
      return next()
    }
    /*   verifyToken(token)
           .then((data) => {
             req.auth = data
             return next()
           })
           .catch((error) => {
             return next()
           })*/
  }
})

// app.use(express.static(path.join(__dirname, 'public')));
let static = express.static(path.join(__dirname, 'public'))
let static1 = static
static1.unless = unless
app.use(static1.unless({ method: 'OPTIONS' }))


app.use(expressjwt({ secret: config.secretKey, algorithms: ['HS256'] }).unless({ path: ['/users/login', '/users/reg', ''] }))


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var articleRouter = require('./routes/article');
var categoryRouter = require('./routes/category');
var menuRouter = require('./routes/menu');
let uploadRouter = require('./routes/upload')



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/article', articleRouter);
app.use('/category', categoryRouter);
app.use('/menu', menuRouter);
app.use('/up', uploadRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err.name == 'UnauthorizedError') return res.send({ flag: false, msg: '认证失败' })
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
