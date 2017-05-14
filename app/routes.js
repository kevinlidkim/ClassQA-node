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
  app.delete('/delete_course/:id', courses.delete_course);
  app.post('/add_course', courses.add_course);
  app.get('/load_enrolled_courses', courses.load_enrolled_courses);
  app.get('/load_taught_courses', courses.load_taught_courses);
  app.get('/load_course/:id', courses.load_course);
  app.post('/upload_material', courses.upload_file);
  app.delete('/delete_file/:id', courses.delete_file);
  app.post('/add_material', courses.add_material);
  app.post('/edit_material', courses.edit_material);
  app.delete('/delete_course/:id', courses.delete_course);


  app.delete('/delete_material/:id', courses.delete_material);
  app.get('/load_material/:id', courses.load_file);
  app.get('/load_qa/:id', questions.load_questions);
  app.post('/ask_question', questions.ask_question);
  app.post('/answer_question', questions.answer_question);
  app.post('/edit_question', questions.edit_question)
  app.get('/load_answers/:id', questions.load_answers);
  app.post('/edit_answer', questions.edit_answer);
  app.delete('/delete_question/:id', questions.delete_question);
  app.delete('/delete_answer/:id', questions.delete_answer);
  app.post('/upvote_answer', questions.upvote_answer);
  app.post('/endorse_answer', questions.endorse_answer);
  app.get('/show_best_answer/:id', questions.show_best_answer);
  app.get('/search_question/:id/:query', questions.search_question);

  app.post('/change_password',users.change_password);
  app.post('/forgot_password',users.forgot_password);

  app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
  });

};
