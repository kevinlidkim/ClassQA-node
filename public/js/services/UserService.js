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
      if (isProfessor) {
        return true;
      } else {
        return false;
      }
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

      //check for professor status
      this.check_Professor();

      return $http.get('/status')
        .then(function(data) {
          if (data.data.status) {
            loggedIn = true;
            user = data.data.user;

            return user;
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

    create_course : function() {

      var crsName = document.getElementById("crsName").value;
      var crsCode = document.getElementById("crsCode").value;
      var crsDept = document.getElementById("crsDept").value;
      var crsSec = document.getElementById("crsSec").value;
      var crsPwd = document.getElementById("crsPwd").value;
      var crsDesc = document.getElementById("crsDesc").value;

      var courseToCreate = {
        name: crsName,
        department: crsDept,
        code: crsCode,
        section: crsSec,
        password: crsPwd,
        description: crsDesc
      }

      // console.log("sending create_course req");
      // console.log(courseToCreate);

      return $http.post('/create_course', courseToCreate)
        .then(function(data) {
          console.log("Successfully Created Course");
          console.log(data);
          return data;
        })
        .catch(function(err) {
          console.log(err);
        })

    },

    add_course : function () {

      var crsDept = document.getElementById("addCrsDept").value;
      var crsCode = document.getElementById("addCrsCode").value;
      var crsSec = document.getElementById("addCrsSec").value;
      var crsPwd = document.getElementById("addCrsPwd").value;

      var courseToAdd = {
        department: crsDept,
        code: crsCode,
        section: crsSec,
        password: crsPwd
      }

      // console.log("sending add_course post request");
      // console.log(courseToAdd);

      return $http.post('/add_course', courseToAdd)
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

      var dataObj = {};

      return $http.post('/load_enrolled_courses', dataObj)
        .then(function(data) {
          console.log("Successfully loaded enrolled Courses");
          console.log(data);
          return data;
        })
        .catch(function(err) {
          console.log(err);
        })
    }

    // load_course : function() {
    // 
    //   var courseId = document.getElementById("courseId").value;
    //
    //   console.log("loading course with id:");
    //   console.log(courseId);
    //
    //   var dataObj = {
    //     params: {
    //         id: courseId
    //     }
    //   }
    //
    //   return $http.get('/load_course', dataObj)
    //     .then(function(data) {
    //       console.log("Successfully loaded enrolled Course");
    //       console.log(data.data.data.course);
    //
    //       selected_course = data.data.data.course;
    //
    //       return selected_course;
    //     })
    //     .catch(function(err) {
    //       console.log(err);
    //     })
    // }



  }

}]);
