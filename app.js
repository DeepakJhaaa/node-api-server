var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var socketIo = require('socket.io');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var env = require('node-env-file');
var app = express();
var swaggerJSDoc = require('swagger-jsdoc');
// swagger definition
var swaggerDefinition = {
  info: {
    title: 'Node Swagger API',
    version: '2.0.0',
    description: 'Demonstrating how to describe a RESTful API with Swagger',
  },
  host: 'localhost:5000',
  basePath: '/',
};

// options for the swagger docs
var options = {
  // import swaggerDefinitions
  swaggerDefinition: swaggerDefinition,
  // path to the API docs
  apis: ['./routes/index.js', './**/routes/*.js', 'routes.js'], // pass all in array
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);

app.use(function(req, res, next) {
  var allowedOrigins = [
    'http://ng-todo.dkjha.com',
    'https://ngx-todo.dkjha.com',
    'http://localhost:4200',
  ];
  var origin = req.headers.origin;
  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, unique_key',
  );
  next();
});

// if in development mode, load .env variables
if (app.get('env') === 'development') {
  env(__dirname + '/config/.env');
}

app.get('/swagger.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// connect to database
app.db = mongoose.connect(process.env.MONGODB_URI);

// view engine setup - this app uses Hogan-Express
// https://github.com/vol4ok/hogan-express
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('layout', 'layout');
app.engine('html', require('hogan-express'));

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Base routes location file for different projects/version
var routes = require('./routes/index');
var routes_U_1_0 = require('./routes/U.1.0/index');
var routes_C_1_0 = require('./routes/C.1.0/index');
var routes_C_1_1 = require('./routes/C.1.1/index');
var routes_TODO_1_0 = require('./services/todo-services/1.0/routes/index');
var routes_TODO_1_1 = require('./services/todo-services/1.1/routes/index');
var routes_P_1_0 = require('./routes/P.1.0/index');

//Multiple routes structure for different projects/versions
app.use('/', routes);
app.use('/v1/chats', routes_C_1_0);
app.use('/v1/chats', routes_C_1_1);
app.use('/v1/users', routes_U_1_0);
app.use('/v1/todos', routes_TODO_1_0);
app.use('/v1/todos', routes_TODO_1_1);
app.use('/v1/players', routes_P_1_0);

//Catch 404 and forward to error handler
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
    res.json({
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {},
  });
});

module.exports = app;
