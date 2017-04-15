angular.module('MainServ', []).factory('MainService', ['$q', '$timeout', '$http', function($q, $timeout, $http) {

  return {

    signup : function(obj) {
      return $http.post('/addusercaptcha', obj)
        .then(function(data) {
          console.log(data);
        })
        .catch(function(err) {
          console.log(err);
        })
    },

    verify_user : function(obj) {
      return $http.post('/verify', obj)
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

