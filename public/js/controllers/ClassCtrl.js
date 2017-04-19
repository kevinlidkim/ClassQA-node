angular.module('ClassCtrl', []).controller('ClassController', ['$scope', '$location', 'moment', 'MainService', 'ClassService', function($scope, $location, moment, MainService, ClassService) {

  $scope.selected_course = {};

  $scope.get_selected_course = function() {
    $scope.selected_course = ClassService.get_selected_course();
    console.log("getting_selected_course");
    console.log($scope.selected_course);
    return $scope.selected_course
  }

  $scope.load_selected_course = function() {

    return ClassService.load_course()
      .then(function(data) {

        console.log("loading selected data");
        console.log(data);

        //data.data.data.course
        //data.data.data.course_materials
        //data.data.data.questions

        $scope.selected_course = data;

        console.log("selected course:");
        console.log($scope.selected_course);

        $location.path('/classPage')

      })
      .catch(function(err) {
        console.log(err);
      })
  }


}]);
