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
    },

    edit_course: function(id) {
      //variables = get form element values

      var courseToEdit = {
        //i think course id is needed to find which course to update
        //name
        //department
        //code
        //section
        //password
        //description
      }

      return $http.post('/edit_course', courseToEdit)
        .then(function(data) {
          console.log("Successfully edited course");
          console.log(data);
          return data;
        })
        .catch(function(err) {
          console.log(err);
        })
    }

  }

}]);
