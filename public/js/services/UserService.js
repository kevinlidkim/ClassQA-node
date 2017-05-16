angular.module('UserServ', []).factory('UserService', ['$q', '$timeout', '$http', function($q, $timeout, $http) {

  var user = null;
  var loggedIn = false;
  var isProfessor = false;

  return {
    // Function that sends username and password to backend
    login : function(obj) {
      // object has username and password parameters
      return $http.post('/login', obj)
        .then(function(data) {
          user = data.data.user;
          loggedIn = true;
          return data;
        })
        .catch(function(err) {
          // Alert the user if there was an error with login
          alert(err.data.status);
          console.log(err);
          throw err;
        })
    },

    // Function that logs the user out
    logout : function() {
      return $http.get('/logout')
        .then(function(data) {
          user = null
          loggedIn = false;
        })
        .catch(function(err) {
          console.log(err);
        })
    },

    // Function that checks if the user is logged in
    is_auth : function() {
      if (loggedIn) {
        return true;
      } else {
        return false;
      }
    },

    // Function that sends an email to backend, which will send it a new password
    forgot_password : function(email) {
      return $http.post('/forgot_password', email)
        .then(function(data) {
          alert(data.data.status);
          console.log("Sucessfully sent email with a new password");
          console.log(data);
        })
        .catch(function(err) {
          console.log("Failed to send email with a new password");
        })
    },

    // Function that sends an old and new password to backend to change
    change_password : function(passwords) {
      return $http.post('/change_password', passwords)
        .then(function(data) {
          alert(data.data.status);
          console.log("Successfully changed password");
          console.log(data);
        })
        .catch(function(err) {
          alert(err.data.status);
          console.log("Failed to change password");
          console.log(err);
        })
    },

    // Function the returns true if user is a professor, false otherwise
    is_Professor : function() {
      return isProfessor;
    },

    // Function that sets the isProfessor variable
    check_Professor : function() {
      return $http.get('/check_professor')
        .then(function(data) {
          isProfessor = data.data.status;
          return data;
        })
        .catch(function(data) {
          console.log("error check_Professor");
        });
    },

    // Function that gets the user's status and updates necessary variables
    get_user_status : function() {
      return $http.get('/status')
        .then(function(data) {
          if (data.data.status) {
            loggedIn = true;
            user = data.data.user;
            return data;
          } else {
            loggedIn = false;
            user = null;
          }
        })
        .catch(function(data) {
          loggedIn = false;
        });
    },

    // Function that gets the number of materials, questions, answers in a course
    get_course_stat: function(id) {
      // id is the id of a course
      var url = /course_stat/ + id;

      return $http.get(url)
        .then(function(data) {
          return data;
        })
        .catch(function(err) {
          console.log(err);
        })
    },

    // Function that returns the user's username
    get_user : function() {
      return user;
    },

    // Function that returns the user's data 
    get_user_data : function() {
      return $http.get('/get_user_data')
        .then(function(data) {
          // console.log(data);
          return data;
        })
        .catch(function(err) {
          console.log(err);
        })
    },

    // Function that creates a course in backend and returns the course
    create_course : function(classObj) {

      return $http.post('/create_course', classObj)
        .then(function(data) {
          alert(data.data.message);
          console.log(data);
          return data;
        })
        .catch(function(err) {
          alert(err.data.error);
          console.log(err);
        })

    },

    // Function that adds a course in backend and returns the course
    add_course : function (classObj) {

      return $http.post('/add_course', classObj)
        .then(function(data) {
          alert(data.data.message);
          console.log(data);
          return data;
        })
        .catch(function(err) {
          alert(err.data.error);
          console.log(err);
        })

    },

    // Function that returns a student's enrolled courses
    load_enrolled_courses : function() {
      return $http.get('/load_enrolled_courses')
        .then(function(data) {
          // console.log("Successfully loaded enrolled Courses");
          console.log(data);
          return data;
        })
        .catch(function(err) {
          console.log(err);
        })
    },

    // Function that returns a professor's taught courses
    load_taught_courses : function() {
      return $http.get('/load_taught_courses')
        .then(function(data) {
          // console.log("Successfully loaded taught Courses");
          console.log(data);
          return data;
        })
        .catch(function(err) {
          console.log(err);
        })
    }

  }

}]);
