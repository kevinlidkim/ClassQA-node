angular.module('ClassServ', []).factory('ClassService', ['$q', '$timeout', '$http', function($q, $timeout, $http) {

  return {

    // signup : function(obj) {
    //   return $http.post('/add_user_captcha', obj)
    //     .then(function(data) {
    //       console.log(data);
    //     })
    //     .catch(function(err) {
    //       console.log(err);
    //     })
    // },
    //
    // verify_user : function(obj) {
    //   return $http.post('/verify', obj)
    //     .then(function(data) {
    //       console.log(data);
    //       return data;
    //     })
    //     .catch(function(err) {
    //       console.log(err);
    //     })
    // }

  }

}]);
