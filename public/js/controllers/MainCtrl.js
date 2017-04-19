angular.module('MainCtrl', []).controller('MainController', ['$scope', '$location', 'vcRecaptchaService', 'MainService', 'UserService', function($scope, $location, recaptcha, MainService, UserService) {

  $scope.username_input = "";
  $scope.password_input = "";
  $scope.email_input = "";
  $scope.verify_input = "";
  $scope.verify_email_input = "";

  $scope.login_username = "";
  $scope.login_password = "";

  $scope.courses_enrolled_in = {};
  $scope.courses_taught = {};

  $scope.empty_signup = function() {
    if ($scope.username_input != "" && $scope.password_input != "" && $scope.email_input != "") {
      return false;
    } else {
      return true;
    }
  }

  $scope.register = function() {
    var captcha_response = recaptcha.getResponse();
    if (captcha_response != "") {
      var obj = {
        username: $scope.username_input,
        password: $scope.password_input,
        email: $scope.email_input,
        'g-recaptcha-response': captcha_response
      }
      $scope.verify_email_input = $scope.email_input;
      $scope.username_input = "";
      $scope.password_input = "";
      $scope.email_input = "";

      MainService.signup(obj);
    }
  }

  $scope.empty_verify = function() {
    if ($scope.verify_input != "" && $scope.verify_email_input != "") {
      return false;
    } else {
      return true;
    }
  }

  $scope.verify_user = function() {
    var obj = {
      email: $scope.verify_email_input,
      key: $scope.verify_input
    }
    $scope.verify_email_input = "";
    $scope.verify_input = "";
    MainService.verify_user(obj)
  }

  $scope.empty_login = function() {
    if ($scope.login_password != "" && $scope.login_password != "") {
      return false;
    } else {
      return true;
    }
  }

  $scope.login = function() {
    var obj = {
      username: $scope.login_username,
      password: $scope.login_password
    }
    $scope.login_username = "";
    $scope.login_password = "";
    UserService.login(obj)
      .then(function(data) {
        $location.path('/home');
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  $scope.logout = function() {
    UserService.logout()
      .then(function() {
        $location.path('/login');
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  $scope.is_logged_in = function() {
    return UserService.is_auth();
  }

  $scope.is_Professor = function() {
    return UserService.is_Professor();
  }

  $scope.add_class = function() {
    // implement
    return UserService.add_course()
      .then(function() {
        $location.path('/home');
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  $scope.create_class = function() {
    // implement
    return UserService.create_course()
      .then(function() {
        $location.path('/home');
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  $scope.load_enrolled = function() {

    return UserService.load_enrolled_courses()
      .then(function(data) {

        $scope.courses_enrolled_in = data.data.courses;

        console.log("enrolled_courses:");
        console.log($scope.courses_enrolled_in);

        $location.path('/home');
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  $scope.load_taught = function() {
    return UserService.load_taught_courses()
      .then(function(data) {

        $scope.courses_taught = data.data.courses;

        console.log("taught_courses:");
        console.log($scope.courses_taught);

        $location.path('/home');
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  $scope.go_to_class = function(id) {
    $location.path('/classPage/' + id);
  }

}]);
