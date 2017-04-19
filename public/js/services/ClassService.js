angular.module('ClassServ', []).factory('ClassService', ['$q', '$timeout', '$http', function($q, $timeout, $http) {

  var selected_course = null;

  return {

    load_course : function() {

      var courseId = document.getElementById("courseId").value;

      console.log("loading course with id:");
      console.log(courseId);

      var dataObj = {
        params: {
            id: courseId
        }
      }

      return $http.get('/load_course', dataObj)
        .then(function(data) {
          console.log("Successfully loaded enrolled Course");
          console.log(data.data.data.course);

          selected_course = data.data.data.course;

          return selected_course;
        })
        .catch(function(err) {
          console.log(err);
        })
    },

    get_selected_course : function() {
      console.log(selected_course);
      return selected_course;
    }

  }

}]);
