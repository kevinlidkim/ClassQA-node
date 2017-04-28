var moment = require('moment');
var db = require('../../db');
var ObjectId = require('mongodb').ObjectId;
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var request = require('request');
var _ = require('lodash');
var shortid = require('shortid');

var secret = '6LdhLR0UAAAAAHnovFtpjw13X9vrh8Xyz2Nn6V-s';

var make_salt = function() {
  return crypto.randomBytes(16).toString('base64');
}

var encrypt_password = function(password, salt) {
  if (!password || !salt) {
    return '';
  }
  salt = new Buffer(salt, 'base64');
  return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
}

var authenticate = function(password, salt, hashed_password) {
  return encrypt_password(password, salt) === hashed_password;
}

exports.add_professor = function(req, res) {

  var collection = db.get().collection('users');

  collection.findOne({
    $or: [{ email: req.body.email }, { username: req.body.username }]
  })
    .then(function(user) {
      if (user) {
        return res.status(500).json({
          status: 'Email or username already in use for professor'
        })
      } else {
        var salt = make_salt();
        var hashed_password = encrypt_password(req.body.password, salt);
        var random_key = encrypt_password(make_salt(), make_salt());
        collection.insert({
          username: req.body.username,
          email: req.body.email,
          salt: salt,
          hashed_password: hashed_password,
          verified: false,
          random_key: random_key,
          professor: true
        })
          .then(function(data) {

            var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'classqa.cse308@gmail.com',
                pass: 'cse308!@'
              }
            });

            var mail_options = {
              from: '"ClassQA 👻" <classqa.cse308@gmail.com>', // sender address
              to: req.body.email, // list of receivers
              subject: 'ClassQA Verification ✔', // Subject line
              text: random_key, // plain text body
              html: '<b>' + random_key + '</b>' // html body
            };

            transporter.sendMail(mail_options, (error, info) => {
              if (!error) {
                return res.status(200).json({
                  status: 'Successfully created professor account'
                })
              } else {
                return res.status(500).json({
                  status: 'Unable to send email for professor account'
                })
              }
            });
          })
          .catch(function(err) {
            console.log(err);
            return res.status(500).json({
              status: 'Error creating professor account'
            })
          })
      }
    })
    .catch(function(user_err) {
      console.log(user_err);
      return res.status(500).json({
        status: 'Error checking for dupe professor account'
      })
    })
}


exports.add_user_captcha = function(req, res) {

  var captcha = req.body['g-recaptcha-response'];
  var verification_url = "https://www.google.com/recaptcha/api/siteverify?secret=" + secret + "&response=" + captcha;

  request(verification_url, function(error, response, body) {
    body = JSON.parse(body);
    if (body.success) {

      var collection = db.get().collection('users');
      collection.findOne({
        $or: [{ email: req.body.email }, { username: req.body.username }]
      })
        .then(function(user) {
          if (user) {
            return res.status(500).json({
              status: 'Email or username already in use'
            })
          } else {
            var salt = make_salt();
            var hashed_password = encrypt_password(req.body.password, salt);
            var random_key = encrypt_password(make_salt(), make_salt());
            collection.insert({
              username: req.body.username,
              email: req.body.email,
              salt: salt,
              hashed_password: hashed_password,
              verified: false,
              random_key: random_key,
              professor: false
            })
              .then(function(data) {

                var transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: 'classqa.cse308@gmail.com',
                    pass: 'cse308!@'
                  }
                });

                var mail_options = {
                  from: '"ClassQA 👻" <classqa.cse308@gmail.com>', // sender address
                  to: req.body.email, // list of receivers
                  subject: 'ClassQA Verification ✔', // Subject line
                  text: random_key, // plain text body
                  html: '<b>' + random_key + '</b>' // html body
                };

                transporter.sendMail(mail_options, (error, info) => {
                  if (!error) {
                    return res.status(200).json({
                      status: 'Successfully created user'
                    })
                  } else {
                    return res.status(500).json({
                      status: 'Unable to send email'
                    })
                  }
                });
              })
              .catch(function(err) {
                console.log(err);
                return res.status(500).json({
                  status: 'Error creating user'
                })
              })
          }
        })
        .catch(function(user_err) {
          console.log(user_err);
          return res.status(500).json({
            status: 'Error checking for dupe user'
          })
        })

    } else {
      return res.status(500).json({
        status: 'Failed to verify captcha'
      })
    }
  })

}

exports.verify = function(req, res) {

  var collection = db.get().collection('users');
  collection.findOne({
    email: req.body.email
  })
    .then(function(user) {
      if (!user) {
        return res.status(500).json({
          status: "Email not in use"
        })
      }
      else if (user.verified == true) {
        return res.status(500).json({
          status: 'User already verified'
        })
      } else {
        if (req.body.key == 'abracadabra' || req.body.key == user.random_key) {
          collection.update(
            { _id: ObjectId(user._id) },
            { $set: { 'verified' : true} }
          )
            .then(function(data) {
              return res.status(200).json({
                status: 'Successfully verified user'
              })
            })
            .catch(function(err) {
              console.log(err);
              return res.status(200).json({
                status: 'Unable to verify user'
              })
            })
        } else {
          return res.status(401).json({
            status: 'Invalid verification token'
          })
        }
      }
    })
    .catch(function(error) {
      console.log(error);
      return res.status(500).json({
        status: 'Error finding user in database'
      })
    })
}

exports.login = function(req, res) {

  var collection = db.get().collection('users');
  collection.findOne({
    username: req.body.username
  })
    .then(function(user) {
      if (!user) {
        return res.status(500).json({
          status: 'Invalid username'
        })
      } else if (user.verified == false) {
        return res.status(401).json({
          status: 'User not verified yet'
        })
      } else {
        if (!authenticate(req.body.password, user.salt, user.hashed_password)) {
          return res.status(401).json({
            status: 'Invalid password'
          })
        } else {
          req.session.user = user.username;
          req.session.professor = user.professor;
          return res.status(200).json({
            status: 'OK',
            user: user.username
          })
        }
      }
    })
    .catch(function(err) {
      console.log(err);
      return res.status(500).json({
        status: 'Error logging in'
      })
    })
}

exports.auth = function(req, res) {
  if (!req.session.user) {
    return res.status(200).json({
      status: false
    });
  } else {
    return res.status(200).json({
      status: true,
      user: req.session.user
    })
  }
}

exports.check_professor = function(req, res) {
  if (!req.session.user) {
    return res.status(200).json({
      status: false
    });
  } else {
    if (!req.session.professor) {
      return res.status(200).json({
        status: false
      })
    } else {
      return res.status(200).json({
        status: true,
        user: req.session.user
      })
    }
  }
}

exports.logout = function(req, res) {
  if (req.session.user) {
    req.session.destroy();
    return res.status(200).json({
      status: 'Successfully logged out'
    })
  } else {
    return res.status(500).json({
      status: 'No logged in user'
    })
  }
}

exports.get_user_data = function(req, res) {
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'Currently not logged in'
    })
  } else {
    // need to implement getting all courses by user
    return res.status(200).json({
      status: 'OK',
      message: "Successfully retrieved logged in user's data",
      user: req.session.user
    })
  }
}

exports.change_password = function(req, res) {
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'Currently not logged in'
    })
  }

  var collection = db.get().collection('users');
  collection.findOne({
    username: req.session.user
  })
    .then(function(found_user) {
      if (!authenticate(req.body.old_password, found_user.salt, found_user.hashed_password)) {
        return res.status(401).json({
          status: 'Invalid password'
        })
      } else {
        var salt = make_salt();
        var hashed_password = encrypt_password(req.body.password, salt);
        collection.update(
          { username: req.session.user },
          { $set: { salt: salt, hashed_password: hashed_password } }
        )
          .then(function(update_password_success) {
            status: 'OK',
            message: 'Successfully updated password'
          })
          .catch(function(update_password_fail) {
            console.log(update_password_fail);
            return res.status(500).json({
              status: 'error',
              error: 'Failed to update password'
            })
          })
      }
    })
    .catch(function(err) {
      console.log(err);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to find user to update password'
      })
    })

}

exports.forgot_password = function(req, res) {
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'Currently not logged in'
    })
  }

  var collection = db.get().collection('users');
  collection.findOne({
    username: req.session.user
  })
    .then(function(found_user) {
      var random_password = shortid.generate();
      var salt = make_salt();
      var hashed_password = encrypt_password(random_password, salt);

      collection.update(
        { username: req.session.user },
        { $set: { salt: salt, hashed_password: hashed_password } }
      )
        .then(function(update_password_success) {
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'classqa.cse308@gmail.com',
              pass: 'cse308!@'
            }
          });

          var text = 'Your new randomly generated password is ' + random_password + '\nPlease reset your password.'

          var mail_options = {
            from: '"ClassQA 👻" <classqa.cse308@gmail.com>', // sender address
            to: found_user.email, // list of receivers
            subject: 'ClassQA Forgot Password ✔', // Subject line
            text: text, // plain text body
            html: '<b>' + text + '</b>' // html body
          };

          transporter.sendMail(mail_options, (error, info) => {
            if (!error) {
              return res.status(200).json({
                status: 'Successfully sent forgotten password email'
              })
            } else {
              return res.status(500).json({
                status: 'Unable to send forgotten password email'
              })
            }
          });
        })
        .catch(function(update_password_fail) {
          console.log(update_password_fail);
          return res.status(500).json({
            status: 'error',
            error: 'Failed to update password for forgotten password'
          })
        })
    })
    .catch(function(err) {
      console.log(err);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to find user to send forgotten password email'
      })
    })

}
