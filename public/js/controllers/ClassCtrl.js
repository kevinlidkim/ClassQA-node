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
  // Tags of the material to be uploaded
  $scope.add_material_tags = [];

  // Title of the material to be edited
  $scope.edit_material_title = "";
  // Document of the material to be edited
  $scope.edit_material_doc = {};
  // Description of the material to be edited
  $scope.edit_material_desc = "";
  // Tags of the material to be edited
  $scope.edit_material_tags = [];

  // material currently being edited
  $scope.material_edit = {};

  var edit_selectize;
  var add_selectize;
  var edit_control;



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

  load_add_selectize = function(options) {

    $scope.add_material_tags = options || [];
    var array = options || [];

    add_selectize = $('#add_material_tags').selectize({
      delimiter: ',',
      persist: true,
      // This is possible dropdown values
      options: array,
      create: function(input) {
          return {
              value: input,
              text: input
          }
      },
      onOptionAdd: function(value, item){
        console.log("ADDING:");
        console.log(value);
        $scope.add_material_tags.push(value);
        console.log("tags are now: ");
        console.log($scope.add_material_tags);
      },
      onOptionRemove: function(value){
        console.log("REMOVE:");
        console.log(value);

        var array = $scope.add_material_tags;

        for (var i = array.length - 1; i >= 0; i--) {
            if (array[i] === value) {
                array.splice(i, 1);
                // break;       //<-- Uncomment  if only the first term has to be removed
            }
        }
        console.log("tags are now: ");
        console.log($scope.add_material_tags);

      }
    });

  }

  load_edit_selectize = function(options) {

    var options = options || [];

    edit_selectize = $('#edit_material_tags').selectize({
      delimiter: ',',
      persist: true,
      // This is possible dropdown values
      options: options,
      create: function(input) {
          return {
              value: input,
              text: input
          }
      },
      onItemAdd: function(value, item){
        console.log("ADDING: " + value);
        $scope.edit_material_tags.push(value);
        console.log("tags are now: ");
        console.log($scope.edit_material_tags);
      },
      onItemRemove: function(value){
        console.log("REMOVE: " + value);
        // USE SPLICE TO REMOVE

        var array = $scope.edit_material_tags;

        for (var i = array.length - 1; i >= 0; i--) {
            if (array[i] === value) {
                array.splice(i, 1);
            }
        }
        console.log("tags are now: ");
        console.log($scope.edit_material_tags);

      }
    });

    var array = options || [];
    var arrayLength = array.length;

    for (var i = 0; i < arrayLength; i++) {
      edit_selectize[0].selectize.addItem(array[i].value,true);
    }
    edit_control = edit_selectize[0].selectize;
  }

  $scope.destory_edit_selectize = function() {
    if(edit_control != null){
      // Destory and recreate with new values
      edit_control.clear();
      edit_control.clearOptions();
      edit_control.destroy();
    }
    $scope.edit_material_tags = [];
    console.log("deleted edit selectize");
  }

  $scope.edit_class = function() {
    var courseToEdit = {
      id: $scope.class_id,
      name: $scope.class.name,
      department: $scope.class.department,
      code: $scope.class.code,
      section: $scope.class.section,
      section: $scope.class.semester,
      section: $scope.class.year,
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

    $scope.add_material_doc = document.getElementById("add_doc").files[0];
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
    var tags = $scope.add_material_tags;

    console.log("TAGS: ");
    console.log(tags);

    var material = {
      file_id: id,
      course_id: $scope.class_id,
      title: title,
      description: description,
      tags : tags

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
    $scope.add_material_doc = document.getElementById("add_doc").files[0];
    console.log($scope.add_material_doc);
  }

  $scope.edit_material = function() {
    //
  }

  $scope.select_material = function(material) {
    $scope.material_edit = material;
    $scope.edit_material_title = material.title;
    // $scope.add_material_doc = {};
    // $scope.edit_material_tags = material.tags;
    $scope.edit_material_desc = material.description;


    // CREATE THE SELECTIZE OPTIONS FROM SAVED TAGS
    //
    var options = [];
    var item = {};

    var array = material.tags || [];
    var arrayLength = array.length;
    for (var i = 0; i < arrayLength; i++) {
      console.log("arrayvalue: " + array[i]);
      item = {
        $order : i,
        text : array[i],
        value : array[i]
      }
      options.push(item);
    }

    console.log(material);
    load_edit_selectize(options);
  }

  //ADD LOAD selectize ON DIFFERENT DIV NAMES AND ADD OPTION OF EDIT_MATERIAL_TAGS
  load_add_selectize(null);
  load_class($routeParams.id);

}]);
