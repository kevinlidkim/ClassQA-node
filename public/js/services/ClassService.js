angular.module('ClassServ', []).factory('ClassService', ['$q', '$timeout', '$http', function($q, $timeout, $http) {

  return {
    load_course: function(id) {
      var url = '/load_course/' + id;
      return $http.get(url)
        .then(function(data) {
          console.log("Successfully selected course");
          console.log(data);
          return data;
        })
        .catch(function(err) {
          console.log(err);
        })
    }

  }

}]);
