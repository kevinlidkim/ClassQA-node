module.exports = function(app) {

  var users = require('./controllers/users');

  app.post('/add_user_captcha', users.add_user_captcha);
  app.post('/verify', users.verify);
  app.post('/login', users.login);
  app.get('/logout', users.logout);
  app.get('/status', users.auth);
  app.get('/get_user_data', users.get_user_data);

  app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
  });

};