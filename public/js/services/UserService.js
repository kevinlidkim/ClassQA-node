angular.module('UserServ', []).factory('UserService', ['$q', '$timeout', '$http', function($q, $timeout, $http) {

  var user = null;
  var loggedIn = false;
  var isProfessor = false;

  return {

    login : function(obj) {
      return $http.post('/login', obj)
        .then(function(data) {
          user = data.data.user;
          loggedIn = true;
        })
        .catch(function(err) {
          console.log(err);
        })
    },

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

    is_auth : function() {
      if (loggedIn) {
        return true;
      } else {
        return false;
      }
    },

    is_Professor : function() {
      return isProfessor;
    },

    //sets the isProfessor variable
    check_Professor : function() {
      return $http.get('/check_professor')
        .then(function(data) {
          isProfessor = data.data.status;
        })
        .catch(function(data) {
          console.log("error check_Professor");
        });
    },

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

    get_user : function() {
      return user;
    },

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

    create_course : function(classObj) {

      return $http.post('/create_course', classObj)
        .then(function(data) {
          console.log("Successfully Created Course");
          console.log(data);
          return data;
        })
        .catch(function(err) {
          console.log(err);
        })

    },

    add_course : function (classObj) {

      return $http.post('/add_course', classObj)
        .then(function(data) {
          console.log("Successfully Added Course");
          console.log(data);
          return data;
        })
        .catch(function(err) {
          console.log(err);
        })

    },

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
