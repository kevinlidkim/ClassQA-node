angular.module('ClassCtrl', []).controller('ClassController', ['$scope', '$location', '$window', '$route', '$routeParams', 'moment', 'MainService', 'UserService', 'ClassService', function($scope, $location, $window, $route, $routeParams, moment, MainService, UserService, ClassService) {

  // Enrolled classes if user is a student, Taught courses if user is a professor
  $scope.user_classes= [];

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
  // fileID
  $scope.edit_material_fileId = [];

  // material currently being edited
  $scope.material_edit = {};

  // variable to check if user is authorized to access class
  var authorized = false;

  // var array for filtering materials
  $scope.filter_material_tags = [];

  // variables for selectize reference
  var edit_selectize;
  var add_selectize;
  var filter_selectize;

  // variables for selectize control
  var edit_control;
  var add_control;
  var filter_control;

  // loads course data with course id of id.
  load_class = function(id) {
    // call class service method to load course
    return ClassService.load_course(id)
      .then(function(data) {
        // save the retrived data
        $scope.class_id = id;
        $scope.class = data.data.data.course;
        $scope.class_materials = data.data.data.course_materials;
        $scope.class_questions = data.data.data.questions;

        // loads the filter selectize
        $scope.load_filter_selectize();
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  // loads courses the student is enrolled in
  load_enrolled = function() {
    // call UserService method to load enrolled courses
    return UserService.load_enrolled_courses()
      .then(function(data) {
        // access and save data retrived from backend
        $scope.user_classes = data.data.courses;
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  // loads courses the professor is teaching
  load_taught = function() {
    // calls UserService to load courses being taught
    return UserService.load_taught_courses()
      .then(function(data) {
        // access and save data retrived from backend
        $scope.user_classes = data.data.courses;
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  // loads selectize for tags on add class material modal
  $scope.load_add_selectize = function() {

    // destory old add selectize if one existed.
    destory_add_selectize();

    // create selectize on input with specific id.
    add_selectize = $('#add_material_tags').selectize({
      // use to seperate the array value
      delimiter: ',',
      // options persist until page reload if true
      persist: true,
      // adds create function for new item
      create: function(input) {
          return {
              value: input,
              text: input
          }
      },
      // callBack function, called on new item added
      onItemAdd: function(value, item){
        // add the new tag to the tags array for adding material
        $scope.add_material_tags.push(value);
      },
      // callBack function, called on item removed
      onItemRemove: function(value){
        // remove the tag from the tags array
        var array = $scope.add_material_tags;

        // search the array for value to remove
        for (var i = array.length - 1; i >= 0; i--) {
            // remove value from array if found.
            if (array[i] === value) {
              array.splice(i, 1);
            }
        }
      }
    });
    // make controller reference for this selectize
    add_control = add_selectize[0].selectize;
  }

  // loads selectize for tags on filter class material modal
  $scope.load_filter_selectize = function() {

    // destory old filter selectize if one existed.
    destory_filter_selectize();

    // create selectize on input with specific id.
    filter_selectize = $('#filter_material_tags').selectize({
      delimiter: ',',
      persist: true,
      // adds create function for new item
      create: function(input) {
          return {
              value: input,
              text: input
          }
      },
      // callBack function, called on new item added
      onItemAdd: function(value, item){

        // add the new tag to the tags array for filter material
        $scope.filter_material_tags.push(value);
        // Filter the materials displayed based on tags in filter_material_tags
        filter_material();
      },
      // callBack function, called on item removed
      onItemRemove: function(value){
        // remove the tag from the tags array
        var array = $scope.filter_material_tags;

        // search the array for value to remove
        for (var i = array.length - 1; i >= 0; i--) {
          // remove value from array if found.
            if (array[i] === value) {
                array.splice(i, 1);
            }
        }
        // check if any tags exist in filter_material_tags
        if(array.length != 0) {
          // if there are tags left, filter the materials based on those tags
          filter_material();
        } else {
          //reload the page. if no tags given for filtering, defaults to return all material
          load_class($scope.class._id);
        }

      },

    });
    // make controller reference for this selectize
    filter_control = filter_selectize[0].selectize;
    // gives the selectize box focus when re rendered
    filter_control.focus();
  }

  // loads selectize for tags on edit class material modal
  load_edit_selectize = function(options) {

    // destory old add selectize if one existed.
    destory_edit_selectize();

    // options to populate the selectize with.
    // if options is null then an empty array used.
    var options = options || [];

    // create selectize on input with specific id.
    edit_selectize = $('#edit_material_tags').selectize({
      delimiter: ',',
      persist: true,
      // possible dropdown options/values
      options: options,
      // adds create function for new item
      create: function(input) {
          return {
              value: input,
              text: input
          }
      },
      // callBack function, called on new item added
      onItemAdd: function(value, item){
        // add the new tag to the tags array for editing material
        $scope.edit_material_tags.push(value);
      },
      onItemRemove: function(value){
        // remove the tag from the tags array
        var array = $scope.edit_material_tags;

        // search the array for value to remove
        for (var i = array.length - 1; i >= 0; i--) {
          // remove value from array if found.
            if (array[i] === value) {
                array.splice(i, 1);
            }
        }
      }
    });

    // make array reference the options array passed in
    var array = options || [];
    // get how many tags there are.
    var arrayLength = array.length;

    for (var i = 0; i < arrayLength; i++) {
      // populate the edit_selectize with each tag found.
      edit_selectize[0].selectize.addItem(array[i].value,true);
    }

    // make controller reference for this selectize
    edit_control = edit_selectize[0].selectize;
  }

  // function to filter material based on tags in filter_material_tags
  filter_material = function() {

    // create the object for backend call
    var options = {
      filter : $scope.filter_material_tags,
      course_id : $scope.class._id
    };

    // calls method in class service with options
    ClassService.filter_material(options)
      .then(function(data) {
        // save the filtered materials returned from backend.
        $scope.class_materials = data.data.materials;
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  // destorys the add selectize instance created.
  destory_add_selectize = function() {

    // check if add_selectize was initialized.
    if(add_control != null){
      // Clear Items
      add_control.clear();
      // Clear Options
      add_control.clearOptions();
      // Destory the instance.
      add_control.destroy();
    }
    // Reset add material tags
    $scope.add_material_tags = [];
  }

  // destorys the add selectize instance created.
  destory_edit_selectize = function() {

    // check if edit_selectize was initialized.
    if(edit_control != null){
      // Clear Items
      edit_control.clear();
      // Clear Options
      edit_control.clearOptions();
      // Destory the instance.
      edit_control.destroy();
    }
    // Reset edit material tags
    $scope.edit_material_tags = [];
  }

  // destorys the add selectize instance created.
  destory_filter_selectize = function() {

    // check if filter_selectize was initialized.
    if(filter_control != null){
      // Clear Items
      filter_control.clear();
      // Clear Options
      filter_control.clearOptions();
      // Destory the instance.
      filter_control.destroy();
    }
    // Reset filter material tags
    $scope.filter_material_tags = [];
  }

  // Function for editing class info
  $scope.edit_class = function() {
    // create the class object to pass to backend
    var courseToEdit = {
      id: $scope.class_id,
      name: $scope.class.name,
      department: $scope.class.department,
      course_email: $scope.class.course_email,
      code: $scope.class.code,
      section: $scope.class.section,
      semester: $scope.class.semester,
      year: $scope.class.year,
      password: $scope.class.password,
      description: $scope.class.description,
    }

    // calls method in class service to reach backend
    ClassService.edit_course(courseToEdit)
      .then(function(data) {

      })
      .catch(function(err) {
        console.log(err);
      })
  }

  // Function for uploading new file
  $scope.upload_material = function() {

    // grab the file being uploaded
    $scope.add_material_doc = document.getElementById("add_doc").files[0];
    var file = $scope.add_material_doc;

    // call method in class service to upload file
    ClassService.upload_material(file)
      .then(function(data) {

        // after file is uploaded, save id reference
        var id = data.data.id;
        // save the material with file with file_id of id.
        $scope.save_material(id);
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  // Function to save material
  $scope.save_material = function(id) {
    // Grab the material info to save.
    var title = $scope.add_material_title;
    var description = $scope.add_material_desc;
    var tags = $scope.add_material_tags;

    // Create the material object.
    var material = {
      file_id: id,
      course_id: $scope.class_id,
      title: title,
      description: description,
      tags : tags
    }

    // call method in ClassService to add material to class.
    ClassService.add_material(material)
      .then(function(data) {

        //refresh the page.
        load_class($scope.class._id);

      })
      .catch(function(err) {
        console.log(err);
      })
  }

  // Function to load material with material_id of id
  $scope.load_qaPage = function(id) {
    $location.path('/qaPage/' + id);
  }

  // Function to validate if file is valid for uploading
  $scope.validate_upload_doc = function() {
    // validate that a document has been attached.
    $scope.add_material_doc = document.getElementById("add_doc").files[0];
  }

  // Function for editing Material info
  $scope.edit_material = function() {

    // Grab the values for editing material
    var title = $scope.edit_material_title;
    var description = $scope.edit_material_desc;
    var tags = $scope.edit_material_tags;

    // creating material object to be updated
    var material = {
      _id: $scope.material_edit._id,
      file_id: $scope.material_edit.file_id,
      course_id: $scope.material_edit.course_id,
      title: title,
      description: description,
      tags : tags
    }

    // calls method in class service to edit material
    ClassService.edit_material(material)
      .then(function(data) {
        // Update the material being displayed so reflect new value
        $scope.material_edit.tags = $scope.edit_material_tags;
      })
      .catch(function(err) {
        console.log(err);
      })

  }

  // Function for selecting material to be edited
  // Also initializes selectize for the edit modal
  $scope.select_material = function(material) {
    // update the variables;
    $scope.material_edit = material;
    $scope.edit_material_title = material.title;
    $scope.edit_material_desc = material.description;

    // options array to initialize edit selectize
    var options = [];
    // selectize item object
    var item = {};

    // reference array to material.tags or empty array if material.tags null/empty.
    var array = material.tags || [];
    // get the number of tags in the array.
    var arrayLength = array.length;

    // populate the options with tags from backend.
    for (var i = 0; i < arrayLength; i++) {
      // create new item object
      item = {
        text : array[i],
        value : array[i]
      }
      // add the item object into array.
      options.push(item);
    }

    // load edit selectize with options
    load_edit_selectize(options);
  }

  // Function for deleting course by id
  $scope.delete_course = function(id) {

    // calls method in class service to delete course
    ClassService.delete_course(id)
      .then(function(data) {
        // redirect to the home page
        $window.location.href = "/home";

      })
      .catch(function(err) {
        console.log(err);
      })
  }

  // Function for deleting material by id
  $scope.delete_material = function(id) {

    // calls method in class service to delete material
    ClassService.delete_material(id)
      .then(function(data) {

        // need to reload the page.
        load_class($scope.class._id);

      })
      .catch(function(err) {
        console.log(err);
      })
  }

  $scope.reset_add_material_modal = function() {
    // Title of the material to be uploaded
    $scope.add_material_title = "";
    // Document of the material to be uploaded
    document.getElementById("add_doc").value = null;
    $scope.add_material_doc = null;
    // Description of the material to be uploaded
    $scope.add_material_desc = "";
    // Tags of the material to be uploaded
    $scope.add_material_tags = [];
  }

  // Function for creating announcements for the course
  $scope.add_announcement = function() {

    // create the announcement object
    var announcement = {
      title: $scope.add_announcement_title,
      body : $scope.add_announcement_body,
      id : $scope.class._id
    }

    // call method in class service to create the announcement
    ClassService.add_announcement(announcement)
      .then(function(data) {

        // Reset the modal field values to blank
        $scope.add_announcement_title = "";
        $scope.add_announcement_body = "";
        // refresh the page.
        load_class($scope.class._id);

      })
      .catch(function(err) {
        console.log(err);
      })
  }

  // On load, validate whether the user has access to the class
  if (UserService.is_Professor()) {
    load_taught()
      .then(function() {
        // Check to see if the selected class is within professor's taught courses
        for (var i = 0; i < $scope.user_classes.length; i++) {
          if($scope.user_classes[i]._id == $routeParams.id) {
            authorized = true;
          }
        }
        // Load the classes if authorized, redirect otherwise
        if (authorized) {
          load_class($routeParams.id);
        } else {
          $location.path('/home');
        }
      })
  } else {
    load_enrolled()
      .then(function() {
        // Check to see if the selected class is within student's enrolled courses
        for (var i = 0; i < $scope.user_classes.length; i++) {
          if($scope.user_classes[i].course_id == $routeParams.id) {
            authorized = true;
          }
        }
        // Load the classes if authorized, redirect otherwise
        if (authorized) {
          load_class($routeParams.id);
        } else {
          $location.path('/home');
        }
      })
  }


}]);
