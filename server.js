// modules =================================================
// require('newrelic');
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var session        = require('express-session');
var cookieParser   = require('cookie-parser');
var request = require('request');
var fs = require("fs");
var MongoStore = require('connect-mongo')(session);

var port = process.env.PORT || 8001; // set our port

var db = require('./db');
var mongo_uri = 'mongodb://localhost:27017/classqa';
// var mongo_uri = 'mongodb://cse308_admin:cse308_admin@ds123361.mlab.com:23361/heroku_0gnr268q'

db.connect(mongo_uri, function(err) {
  if (err) {
    console.log("Error connecting to mongo");
  } else {
    console.log("Connected to mongo");
    // !!  IMPORTANT  !!
    // DO NOT IMPORT MATERIALS UNTIL YOU IMPORT COURSES (SO YOU CAN GET THE COURSE ID) AND UPLOAD YOUR OWN FILE
    // DO NOT IMPORT QUESTIONS UNTIL YOU IMPORT MATERIALS (SO YOU CAN GET THE MATERIALS ID)
    // DO NOT IMPORT ANSWERS UNTIL YOU IMPORT QUESTIONS (SO YOU CAN GET QUESTIONS ID)

    // import_test_data('mock_users.json', 'users');
    // import_test_data('mock_courses.json', 'courses');
    // import_test_data('mock_materials.json', 'course_material')
    // import_test_data('mock_questions.json', 'questions');
    // import_test_data('mock_answers.json', 'answers');
  }
})

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(cookieParser());
app.use(session({resave: false,
                 saveUninitialized: false,
                 secret: 'myboyjamalpark',
                 cookie: { maxAge: 1000 * 60 * 60 * 24 },
                 store: new MongoStore({ 
                          url: mongo_uri,
                          touchAfter: 24 * 3600
                        })
               }));


app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// routes ==================================================
require('./app/routes')(app); // pass our application into our routes

// start app ===============================================
app.listen(port);
console.log('\nServer hosted on port ' + port);       // shoutout to the user
exports = module.exports = app;             // expose app


// Password for all mock users is "admin"
function import_test_data(filename, collectionname) {
  var collection = db.get().collection(collectionname);
  var file_dir = "./test-data";
  fs.readdir(file_dir, function(err, files) {
    if (err) {
      console.log('error finding mock data directory');
    } else {
      var json_dir = file_dir + '/' + filename;
      var json_file = JSON.parse(fs.readFileSync(json_dir).toString());
      var insert_array = [];
      for (var i = 0; i < json_file.length; i++) {
        insert_array.push(collection.insert(json_file[i]));
      }
    }
  })
}