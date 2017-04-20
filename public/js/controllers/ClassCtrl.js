angular.module('ClassCtrl', []).controller('ClassController', ['$scope', '$location', '$routeParams', 'moment', 'MainService', 'ClassService', function($scope, $location, $routeParams, moment, MainService, ClassService) {

  $scope.class = {};
  $scope.class_materials = [];
  $scope.class_questions = [];

  load_class = function(id) {

    console.log("loading class with id: " + id);

    return ClassService.load_course(id)
      .then(function(data) {
        console.log("load_class response:");
        console.log(data);

        $scope.class = data.data.data.course;
        $scope.class_materials = data.data.data.course_materials;
        $scope.class_questions = data.data.data.questions;
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  load_class($routeParams.id);

}]);
