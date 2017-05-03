angular.module('ClassCtrl', []).controller('ClassController', ['$scope', '$location', '$routeParams', 'moment', 'MainService', 'ClassService', function($scope, $location, $routeParams, moment, MainService, ClassService) {

  // Id of class object, used to reference to backend
  $scope.class_id = "";

  // class currently being accessed
  $scope.class = {};
  // Array Of Materials for the class being accessed
  $scope.class_materials = [];
  // Array Of questions for the class Material being accessed
  $scope.class_questions = [];

  // Title of the material to be uploaded
  $scope.add_material_title = "";
  // Document of the material to be uploaded
  $scope.add_material_doc = {};
  // Description of the material to be uploaded
  $scope.add_material_desc = "";

  load_class = function(id) {

    console.log("loading class with id: " + id);

    return ClassService.load_course(id)
      .then(function(data) {
        $scope.class_id = id;
        $scope.class = data.data.data.course;
        $scope.class_materials = data.data.data.course_materials;
        $scope.class_questions = data.data.data.questions;
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  $scope.edit_class = function() {
    var courseToEdit = {
      id: $scope.class_id,
      name: $scope.class.name,
      department: $scope.class.department,
      code: $scope.class.code,
      section: $scope.class.section,
      password: $scope.class.password,
      description: $scope.class.description,
    }

    ClassService.edit_course(courseToEdit)
      .then(function(data) {

      })
      .catch(function(err) {
        console.log(err);
      })
  }

  $scope.upload_material = function() {

    $scope.add_material_doc = document.getElementById("doc").files[0];
    var file = $scope.add_material_doc;

    console.log("uploading file: ");
    console.log(file);

    ClassService.upload_material(file)
      .then(function(data) {
        var id = data.data.id;
        $scope.save_material(id);
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  $scope.save_material = function(id) {
    var title = $scope.add_material_title;
    var description = $scope.add_material_desc;

    var material = {
      file_id: id,
      course_id: $scope.class_id,
      title: title,
      description: description
      
    }

    console.log("saving material: ");
    console.log(material);

    ClassService.add_material(material)
      .then(function(data) {
        console.log(data);
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  $scope.load_qaPage = function(id) {
    $location.path('/qaPage/' + id);
  }

  $scope.validate_upload_doc = function() {
    $scope.add_material_doc = document.getElementById("doc").files[0];
    console.log($scope.add_material_doc);
  }

  load_class($routeParams.id);

}]);
