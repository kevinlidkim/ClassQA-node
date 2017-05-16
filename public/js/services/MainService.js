angular.module('MainServ', []).factory('MainService', ['$q', '$timeout', '$http', function($q, $timeout, $http) {

  return {

    // Function that passes in account info and captcha response to sign up
    signup : function(obj) {
      return $http.post('/add_user_captcha', obj)
        .then(function(data) {
          alert(data.data.status + ". Verify your account now.");
          console.log(data);
        })
        .catch(function(err) {
          alert(err.data.status);
          console.log(err);
        })
    },

    // Function that verifies user with a verification code
    verify_user : function(obj) {
      return $http.post('/verify', obj)
        .then(function(data) {
          alert(data.data.status);
          console.log(data);
          return data;
        })
        .catch(function(err) {
          alert(err.data.status);
          console.log(err);
        })
    },

    // Function that resets and sends a new password to the email
    forgot_password: function() {
      return $http.post('/forgot_password', email)
        .then(function(data) {
          console.log(data);
          return data;
        })
        .catch(function(err) {
          console.log(err);
        })
    }

  }

}]);
