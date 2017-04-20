module.exports = function(app) {

  var users = require('./controllers/users');
  var courses = require('./controllers/courses');
  var questions = require('./controllers/questions');

  app.post('/add_professor', users.add_professor);
  app.post('/add_user_captcha', users.add_user_captcha);
  app.post('/verify', users.verify);
  app.post('/login', users.login);
  app.get('/status', users.auth);
  app.get('/check_professor', users.check_professor);
  app.get('/logout', users.logout);
  app.get('/get_user_data', users.get_user_data);

  app.post('/create_course', courses.create_course);
  app.post('/edit_course', courses.edit_course);
  app.post('/add_course', courses.add_course);
  app.get('/load_enrolled_courses', courses.load_enrolled_courses);
  app.get('/load_taught_courses', courses.load_taught_courses);
  app.get('/load_course/:id', courses.load_course);
  app.post('/upload_material', courses.upload_material);
  app.post('/add_material', courses.add_material);
  


  // app.get('/load_qa', questions.load_course);

  app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
  });

};
