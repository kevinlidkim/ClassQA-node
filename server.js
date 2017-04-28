// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var session        = require('express-session');
var cookieParser   = require('cookie-parser');
var request = require('request');
var MongoStore = require('connect-mongo')(session);

var port = process.env.PORT || 8001; // set our port

var db = require('./db');
var mongo_uri = 'mongodb://localhost:27017/classqa';

db.connect(mongo_uri, function(err) {
  if (err) {
    console.log("Error connecting to mongo");
  } else {
    console.log("Connected to mongo");
  }
})

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(cookieParser());
app.use(session({resave: true,
                 saveUninitialized: true,
                 secret: 'myboyjamalpark',
                 cookie: { maxAge: 1000 * 60 * 60 * 2 },
                 store: new MongoStore({ url: mongo_uri })
               }));


app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// routes ==================================================
require('./app/routes')(app); // pass our application into our routes

// start app ===============================================
app.listen(port);
console.log('\nServer hosted on port ' + port);       // shoutout to the user
exports = module.exports = app;             // expose app
