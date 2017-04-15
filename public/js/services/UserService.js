angular.module('UserServ', []).factory('UserService', ['$q', '$timeout', '$http', function($q, $timeout, $http) {

  var user = null;
  var loggedIn = false;

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
          // console.log(data);
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

    get_user_status : function() {
      return $http.get('/status')
        .then(function(data) {
          if (data.data.status) {
            loggedIn = true;
            user = data.data.user;
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
    }
    
  }

}]);

