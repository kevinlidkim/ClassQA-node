angular.module('MainCtrl', []).controller('MainController', ['$scope', '$location', '$window', 'vcRecaptchaService', 'MainService', 'UserService', function($scope, $location, $window, recaptcha, MainService, UserService) {

  // Variables for registering
  $scope.username_input = "";
  $scope.password_input = "";
  $scope.email_input = "";
  $scope.verify_input = "";
  $scope.verify_email_input = "";

  // Variables for login
  $scope.forgot_password_email = "";
  $scope.login_username = "";
  $scope.login_password = "";

  // Variables for loading courses for homePage
  $scope.courses_enrolled_in = {};
  $scope.courses_taught = {};

  // Variables for creating class
  $scope.crsName = "";
  $scope.crsEmail = "";
  $scope.crsCode = "";
  $scope.crsDept = "";
  $scope.crsSec = "";
  $scope.crsPwd = "";
  $scope.crsDesc = "";

  // Variables for adding class
  $scope.addCrsDept = "";
  $scope.addCrsCode = "";
  $scope.addCrsSec = "";
  $scope.addCrsPwd = "";

  // Function for form check for signing up
  $scope.empty_signup = function() {
    var captcha_response = recaptcha.getResponse();
    if ($scope.username_input != "" && $scope.password_input != "" && $scope.email_input != "" && captcha_response != "") {
      return false;
    } else {
      return true;
    }
  }

  // Function for registering new user
  $scope.register = function() {
    // check captcha to verify human
    var captcha_response = recaptcha.getResponse();
    if (captcha_response != "") {
      // create signup object
      var obj = {
        username: $scope.username_input,
        password: $scope.password_input,
        email: $scope.email_input,
        'g-recaptcha-response': captcha_response
      }
      // load the email field for verify email form
      $scope.verify_email_input = $scope.email_input;
      // reset values for register form
      $scope.username_input = "";
      $scope.password_input = "";
      $scope.email_input = "";

      MainService.signup(obj);
    }
  }

  // Function for email verification valid form check.
  $scope.empty_verify = function() {
    if ($scope.verify_input != "" && $scope.verify_email_input != "") {
      return false;
    } else {
      return true;
    }
  }

  // Function for verifying new user email
  $scope.verify_user = function() {
    // create the object for new user email verification
    var obj = {
      email: $scope.verify_email_input,
      key: $scope.verify_input
    }
    // reset the form value.
    $scope.verify_email_input = "";
    $scope.verify_input = "";
    // call Main service method to verify user
    MainService.verify_user(obj)
  }

  // Function for checking if login fields are empty
  $scope.empty_login = function() {
    // if username and password field is not empty return true;
    if ($scope.login_username != "" && $scope.login_password != "") {
      return false;
    } else {
      return true;
    }
  }

  // Function for login, uses method in main service
  $scope.empty_email = function() {
    if ($scope.forgot_password_email != "") {
      return false;
    } else {
      return true;
    }
  }

  $scope.login = function() {
    // Create the object for log in
    var obj = {
      username: $scope.login_username,
      password: $scope.login_password
    }
    // Reset the username/password input fields
    $scope.login_username = "";
    $scope.login_password = "";
    // call user service to log in.
    UserService.login(obj)
      .then(function(data) {
        // change url to home and loads home page
        $window.location.href = "/home";
      })
      .catch(function(err) {
        // if err, log to console
        console.log(err);
      })
  }

  // Function for logout, usees method in main service
  $scope.logout = function() {
    // calls user service logout method
    UserService.logout()
      .then(function() {
        // change url to login and loads login page.
        $location.path('/login');
      })
      .catch(function(err) {
        // if err, log to console
        console.log(err);
      })
  }

  // Function to check if user is logged in
  $scope.is_logged_in = function() {
    return UserService.is_auth();
  }

  // Function to check if user is a professor
  $scope.forgot_password = function() {
    var email = { email : $scope.forgot_password_email };
    return UserService.forgot_password(email)
      .then(function() {
        $scope.forgot_password_email = "";
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  $scope.is_Professor = function() {
    // calls user service, returns true if current usr is professor
    return UserService.is_Professor();
  }

  // Function for students adding class
  $scope.add_class = function() {
    // Create the class object to be added
    var classObj = {
      department: $scope.addCrsDept,
      code: $scope.addCrsCode,
      section: $scope.addCrsSec,
      password: $scope.addCrsPwd
    }
    // call user service to add class
    return UserService.add_course(classObj)
      .then(function() {

        // reload classes displayed on homepage
        reload_classes();

      })
      .catch(function(err) {
        // if error, log to console
        console.log(err);
      })
  }

  // Function for professors creating class
  $scope.create_class = function() {
    // Create the class object to be created.
    var classObj = {
      name : $scope.crsName,
      course_email: $scope.crsEmail,
      code : $scope.crsCode,
      department : $scope.crsDept,
      section : $scope.crsSec,
      semester : $scope.crsSem,
      year : $scope.crsYear,
      password : $scope.crsPwd,
      description : $scope.crsDesc
    }

    // call user service to create class
    return UserService.create_course(classObj)
      .then(function() {

        // reload classes displayed on homepage
        reload_classes();

      })
      .catch(function(err) {
        console.log(err);
      })
  }

  // Function for students, loads classes they are enrolled in
  $scope.load_enrolled = function() {

    // calls user service to load enrolled courses for student
    return UserService.load_enrolled_courses()
      .then(function(data) {
        // save data returned from backend to scope variable.
        $scope.courses_enrolled_in = data.data.courses;

        // Set the course statistics for each course
        $scope.courses_enrolled_in.forEach(function(course) {
          return UserService.get_course_stat(course.course_id)
            .then(function(data) {
              course.answers = data.data.statistics.answers;
              course.course_materials = data.data.statistics.course_materials;
              course.questions = data.data.statistics.questions;
            })
            .catch(function(err) {

            })
        })
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  // Function for professors, loads classes they are teaching
  $scope.load_taught = function() {

    // calls user service to load taught courses for professors
    return UserService.load_taught_courses()
      .then(function(data) {
        // save data returned from backend to scope variable.
        $scope.courses_taught = data.data.courses;

        // Set the course statistics for each course
        $scope.courses_taught.forEach(function(course) {
          return UserService.get_course_stat(course._id)
            .then(function(data) {
              course.answers = data.data.statistics.answers;
              course.course_materials = data.data.statistics.course_materials;
              course.questions = data.data.statistics.questions;
            })
            .catch(function(err) {
              
            })
        })
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  // Function for loading classPage with specific Id.
  $scope.load_classPage = function(id) {
    $location.path('/classPage/' + id);
  }

  // Function for retrieving classes taught/enrolled_in
  // Reloads Classes displayed on Homepage
  reload_classes = function() {
    // calls user service
    UserService.check_Professor()
      .then(function(data) {
        if(UserService.is_Professor()) {
          // if professor use load taught
          $scope.load_taught();
        } else {
          // if student use load enrolled
          $scope.load_enrolled();
        }
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  //call to load classes to be displayed on homepage
  reload_classes();

}]);
