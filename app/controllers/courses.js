// Importing necessary modules
var moment = require('moment');
var db = require('../../db');
var stream = require('stream');
var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectId;
var _ = require('lodash');
var shortid = require('shortid');

var multer = require('multer');
var upload = multer().single('file');

// Function to create a course and add it to the database
exports.create_course = function(req, res) {

  // Make sure the logged in user is a professor
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  } else if (!req.session.professor) {
    return res.status(401).json({
      status: 'error',
      error: 'You are not authorized to create a course'
    })
  }

  // Create a course and add it to the database
  var collection = db.get().collection('courses');
  collection.insert({
    name: req.body.name,
    department: req.body.department,
    code: req.body.code,
    section: req.body.section,
    semester: req.body.semester,
    year: req.body.year,
    password: req.body.password,
    description: req.body.description,
    professor: req.session.user,
    course_email: req.body.course_email
  })
    .then(function(course) {
      return res.status(200).json({
        status: 'OK',
        message: 'Successfully created course',
        password: req.body.password
      })
    })
    .catch(function(err) {
      console.log(err);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to create course'
      })
    })
}

// Function to edit course information
exports.edit_course = function(req, res) {

  // Make sure the logged in user is a professor
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  } else if (!req.session.professor) {
    return res.status(401).json({
      status: 'error',
      error: 'You are authorized to create a course'
    })
  }

  // Update the course information in the database
  var collection = db.get().collection('courses');
  collection.update({
    _id: ObjectId(req.body.id)
  },
  {$set:
    {
      name: req.body.name,
      department: req.body.department,
      code: req.body.code,
      section: req.body.section,
      semester: req.body.semester,
      year: req.body.year,
      password: req.body.password,
      description: req.body.description,
      course_email: req.body.course_email
    }
  })
    .then(function(course) {
      return res.status(200).json({
        status: 'OK',
        message: 'Successfully edited course',
      })
    })
    .catch(function(err) {
      console.log(err);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to edit course'
      })
    })
}

// Function to delete a course
exports.delete_course = function(req, res) {

  // Check to make sure logged in user is a professor
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  } else if (!req.session.professor) {
    return res.status(401).json({
      status: 'error',
      error: 'You are authorized to delete the course'
    })
  } else if (req.params.id.length != 24) {
    return res.status(500).json({
      status: 'error',
      error: 'Invalid course id'
    })
  }

  var materials = [];
  var questions = [];

  // Remove the course by its id
  var collection = db.get().collection('courses');
  var sec_collection = db.get().collection('course_materials');
  var thi_collection = db.get().collection('questions');
  var fou_collection = db.get().collection('answers');
  var fif_collection = db.get().collection('upvotes');
  var six_collection = db.get().collection('endorse');
  var sev_collection = db.get().collection('files');
  var eig_collection = db.get().collection('enrolled_in');
  collection.remove({
    _id: ObjectId(req.params.id)
  })
    .then(function(remove_course_success) {
      // Find all course materials linked to deleted course
      sec_collection.find({
        course_id: req.params.id
      }).toArray()
        .then(function(found_materials) {
          if (found_materials && found_materials.length > 0) {
            // Find all questions related to course material
            materials = found_materials;
            var find_question_array = [];
            _.forEach(found_materials, function(find_question) {
              find_question_array.push(thi_collection.find({ material: find_question._id.toString() + '' }).toArray());
            })
            // Resolve all promises to get an array of array of questions
            Promise.all(find_question_array)
            .then(function(results) {
              // Flatten out array of questions
              var found_questions = [].concat.apply([], results);
              // Find all answers related to questions related to course material
              questions = found_questions;
              var find_answer_array = [];
              _.forEach(found_questions, function(find_answer) {
                var string = find_answer._id.toString() + ''
                var str = find_answer._id.toString();
                console.log(string)
                console.log(str)
                find_answer_array.push(fou_collection.find({ question: find_answer._id.toString() }).toArray());
              })
              // Resolve all promises to get an array of array of answers
              Promise.all(find_answer_array)
                .then(function(values) {
                  // Flatten out array of answers
                  var answers = [].concat.apply([], values);
                  // Delete all answers related to course
                  var delete_array = [];
                  _.forEach(answers, function(answer) {
                    delete_array.push(fou_collection.remove({ _id: ObjectId(answer._id) }));
                    delete_array.push(fif_collection.remove({ answer: answer._id.toString() + '' }));
                    delete_array.push(six_collection.remove({ answer: answer._id.toString() + '' }));
                  })
                  // Delete all questions related to course
                  _.forEach(questions, function(question) {
                    delete_array.push(thi_collection.remove({ _id: ObjectId(question._id) }));
                  })
                  // Delete all course materials and files related to course
                  _.forEach(materials, function(material) {
                    delete_array.push(sec_collection.remove({ _id: ObjectId(material._id) }));
                    delete_array.push(sev_collection.remove({ _id: ObjectId(material.file_id) }));
                  })
                  // Delete all enrolled in relationships for this course
                  delete_array.push(eig_collection.remove({ course_id: ObjectId(req.params.id) }));

                  // Resolve all promises before returning response
                  Promise.all(delete_array)
                    .then(function(delete_success) {
                      return res.status(200).json({
                        status: 'OK',
                        message: 'Successfully deleted course and associated materials, questions, and answers'
                      })
                    })
                    .catch(function(delete_fail) {
                      console.log(delete_fail);
                      return res.status(500).json({
                        status: 'error',
                        error: 'Failed to delete questions and answers of course material'
                      })
                    })
                })
                .catch(function(find_answers_fail) {
                  console.log(find_answers_fail);
                  return res.status(500).json({
                    status: 'error',
                    error: 'Failed to find answers from course to delete'
                  })
                })
            })
            .catch(function(find_questions_fail) {
              console.log(find_questions_fail);
              return res.status(500).json({
                status: 'error',
                error: 'Failed to find questions from course to delete'
              })
            })
          } else {
            // return so that page can be refreshed
            return res.status(200).json({
              status: 'OK',
              message: 'Successfully deleted course',
              data: ""
            })
          }
        })
        .catch(function(found_materials_fail) {
          console.log(found_materials_fail);
          return res.status(500).json({
            status: 'error',
            error: 'Failed to find course materials from course to delete'
          })
        })
    })
    .catch(function(remove_course_fail) {
      console.log(remove_course_fail);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to delete course'
      })
    })
}

// Function for users to enroll in a course
exports.add_course = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  // Check to see if course exists
  var collection = db.get().collection('courses');
  var sec_collection = db.get().collection('enrolled_in');
  collection.findOne({
    department: req.body.department,
    code: req.body.code,
    section: req.body.section,
    password: req.body.password
  })
    .then(function(course) {
      // Check to make sure user isn't already enrolled in course
      if (course) {
        sec_collection.findOne({
          student: req.session.user,
          department: course.department,
          code: course.code,
          section: course.section,
          name: course.name,
          description: course.description,
          professor: course.professor
        })
          .then(function(enrolled_relation) {
            if (enrolled_relation) {
              return res.status(500).json({
                status: 'error',
                error: 'User already enrolled in course'
              })
            } else {
              // Create student enrolled in course relationship in database
              sec_collection.insert({
                student: req.session.user,
                department: course.department,
                code: course.code,
                section: course.section,
                name: course.name,
                description: course.description,
                professor: course.professor,
                course_id: course._id,
              })
                .then(function(enrolling) {
                  return res.status(200).json({
                    status: 'OK',
                    message: 'Successfully enrolled in course'
                  })
                })
                .catch(function(enrolling_fail) {
                  console.log(enrolling_fail)
                  return res.status(500).json({
                    status: 'error',
                    error: 'Failed to enroll in course'
                  })
                })
            }
          })
          .catch(function(enrolled_relation_err) {
            console.log(enrolled_relation_err);
            return res.status(500).json({
              status: 'error',
              error: 'Failed to check if user is already enrolled in course'
            })
          })
      } else {
        return res.status(500).json({
          status: 'error',
          error: 'Invalid course credentials provided'
        })
      }
    })
    .catch(function(course_err) {
      console.log(course_err);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to check if course exists for enrollment'
      })
    })
}

// Function to load all courses user is enrolled in
exports.load_enrolled_courses = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  // Finds all courses current user is enrolled in
  var collection = db.get().collection('enrolled_in');
  collection.find({
    student: req.session.user
  }).toArray()
    .then(function(enrolled_courses) {
      return res.status(200).json({
        status: 'OK',
        message: 'Successfully loaded all enrolled courses',
        courses: enrolled_courses
      })
    })
    .catch(function(enrolled_fail) {
      console.log(enrolled_fail);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to load all enrolled courses'
      })
    })

}

// Function to load all courses the logged in user teaches
exports.load_taught_courses = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  } else if (!req.session.professor) {
    return res.status(401).json({
      status: 'error',
      error: 'You are not authorized to view this'
    })
  }

  // Find all courses current user is a professor in
  var collection = db.get().collection('courses');
  collection.find({
    professor: req.session.user
  }).toArray()
    .then(function(taught_courses) {
      return res.status(200).json({
        status: 'OK',
        message: 'Successfully loaded all taught courses',
        courses: taught_courses
      })
    })
    .catch(function(taught_fail) {
      console.log(taught_fail);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to load all taught courses'
      })
    })

}

// Function to load up all course material, information, and questions of a given course
exports.load_course = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  } else if (req.params.id.length != 24) {
    return res.status(500).json({
      status: 'error',
      error: 'Invalid course id'
    })
  }

  var obj = {
    course: {},
    course_materials: [],
    questions: []
  }

  // Check to see if course exists
  var collection = db.get().collection('courses');
  var sec_collection = db.get().collection('course_materials');
  var thi_collection = db.get().collection('questions');
  collection.findOne({
    _id: ObjectId(req.params.id)
  })
    .then(function(course) {
      if (course) {
        obj.course = course;
        // Find all course materials related to course
        sec_collection.find({
          course_id: req.params.id
        }).toArray()
          .then(function(course_materials) {
            obj.course_materials = course_materials;
            // Find all questions related to course materials
            thi_collection.find({
              course: req.params.id
            }).toArray()
              .then(function(questions) {
                // Set session variable for selected course's id
                req.session.course_id = course._id;
                obj.questions = questions;
                return res.status(200).json({
                  status: 'OK',
                  message: 'Successfully loaded course',
                  data: obj
                })

              })
              .catch(function(questions_failed) {
                console.log(questions_failed);
                return res.status(500).json({
                  status: 'error',
                  error: 'Failed to load course (Questions)'
                })
              })

          })
          .catch(function(course_materials_failed) {
            console.log(course_materials_failed);
            return res.status(500).json({
              status: 'error',
              error: 'Failed to load course (Course material)'
            })
          })
      } else {
        return res.status(500).json({
          status: 'error',
          error: 'Could not find course to load'
        })
      }
    })
    .catch(function(course_fail) {
      console.log(course_fail);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to load course'
      })
    })

}

// Function to upload files to the database
exports.upload_file = function(req, res) {

  // Check to make sure user is a professor
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  } else if (!req.session.professor) {
    return res.status(401).json({
      status: 'error',
      error: 'You are not authorized to upload course materials'
    })
  }

  // Upload file to server using multer
  upload(req, res, function(err) {
    if (err) {
      console.log(err);
      return res.status(404).json({
        status: 'Failed to upload file'
      })
    } else {
      // Insert file into database
      var collection = db.get().collection('files');
      collection.insert({
        chunk: req.file.buffer,
        name: req.file.originalname,
        mimetype: req.file.mimetype,
        user: req.session.user
      })
        .then(function(uploaded_file) {
          var id = uploaded_file.ops[0]._id;
          return res.status(200).json({
            status: 'OK',
            message: 'Successfully uploaded file',
            id: id
          })
        })
        .catch(function(upload_fail) {
          console.log(upload_fail);
          return res.status(500).json({
            status: 'error',
            error: 'Failed to upload file'
          })
        })

    }
  })

}

// Function to load file from database
exports.load_file = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  } else if (req.params.id.length != 24) {
    return res.status(500).json({
      status: 'error',
      error: 'Invalid file id'
    })
  }

  // Grab file from database
  var material_id = req.params.id;
  var collection = db.get().collection('course_materials');
  var sec_collection = db.get().collection('files');
  collection.findOne({
    _id: ObjectId(material_id)
  })
    .then(function(found_material) {
      sec_collection.findOne({
        _id: ObjectId(found_material.file_id)
      })
        .then(function(file_data) {
          if (file_data) {
            // Set appropriate headers
            res.set('Content-Type', file_data.mimetype);
            res.header('Content-Type', file_data.mimetype);

            res.writeHead(200, {
              'Content-Type': file_data.mimetype,
              'Content-disposition': 'attachment;filename=' + file_data.name,
              'Content-Length': file_data.chunk.buffer.length
            });
            // Send file back
            res.end(file_data.chunk.buffer);

          } else {
            return res.status(500).json({
              status: 'error',
              error: 'File does not exist'
            })
          }
        }).catch(function(err) {
          console.log(err);
          return res.status(500).json({
            status: 'error',
            error: 'Failed to find file'
          })
        })
    })
    .catch(function(found_material_fail) {
      console.log(found_material_fail);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to find material to load file'
      })
    })

}

// Function to get all ids of materials in a given course
exports.load_materials = function(req, res) {
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  // Finds all materials within the course
  var collection = db.get().collection('course_materials');
  collection.find({
    course_id: req.session.course_id
  }).toArray()
    .then(function(found_materials) {
      return res.status(200).json({
        status: 'OK',
        message: 'Successfully loaded all course materials',
        materials: found_materials
      })
    })
    .catch(function(found_materials_fail) {
      console.log(found_materials_fail);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to load all course materials'
      })
    })
}

// Function to link up files to courses
exports.add_material = function(req, res) {

  // Check to see if logged in user is a professor
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  } else if (!req.session.professor) {
    return res.status(401).json({
      status: 'error',
      error: 'You are not authorized to add course materials'
    })
  }

  // Check to see if relationship already exists or not
  var collection = db.get().collection('course_materials');
  collection.findOne({
    file_id: req.body.file_id,
    course_id: req.body.course_id
  })
    .then(function(course_relation) {
      if (course_relation) {
        return res.status(500).json({
          status: 'error',
          error: 'File already exists under course material'
        })
      } else {
        // Links the uploaded file to the course
        collection.insert({
          file_id: req.body.file_id,
          course_id: req.body.course_id,
          title: req.body.title,
          description: req.body.description,
          tags: req.body.tags
        })
          .then(function(material_insert) {
            return res.status(200).json({
              status: 'OK',
              message: 'Successfully added material to course page'
            })
          })
          .catch(function(material_insert_fail) {
            console.log(material_insert_fail);
            return res.status(500).json({
              status: 'error',
              error: 'Failed to add material to course page'
            })
          })
      }
    })
    .catch(function(course_relation_fail) {
      console.log(course_relation_fail);
      return res.status(500).json({
        status: 'error',
        error: 'Could not check for duplicate file'
      })
    })
}

// Function for professor to update course material
exports.edit_material = function(req, res) {

  // Check to see if logged in user is a professor
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  } else if (!req.session.professor) {
    return res.status(401).json({
      status: 'error',
      error: 'You are not authorized to edit course materials'
    })
  }

  // Update the course material relationship in the database
  var collection = db.get().collection('course_materials');
  collection.update(
    { _id: ObjectId(req.body._id) },
    { file_id: req.body.file_id,
      course_id: req.body.course_id,
      title: req.body.title,
      description: req.body.description,
      tags: req.body.tags }
  )
    .then(function(update_success) {
      return res.status(200).json({
        status: 'OK',
        message: 'Successfully updated course material'
      })
    })
    .catch(function(update_fail) {
      return res.status(500).json({
        status: 'error',
        error: 'Failed to update course material'
      })
    })

}

// Function to remove course material relationship
exports.delete_material = function(req, res) {

  // Check to see if logged in user is a professor
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  } else if (!req.session.professor) {
    return res.status(401).json({
      status: 'error',
      error: 'You are not authorized to delete course materials'
    })
  }

  var questions = [];
  var material_file = {};

  // Delete the course to file relationship
  var collection = db.get().collection('course_materials');
  var sec_collection = db.get().collection('questions');
  var thi_collection = db.get().collection('answers');
  var fou_collection = db.get().collection('upvotes');
  var fif_collection = db.get().collection('endorse');
  var six_collection = db.get().collection('files');
  collection.findAndRemove({
    _id: ObjectId(req.params.id)
  })
    .then(function(delete_success) {
      // Delete the file associated with this course material
      six_collection.remove({
        _id: ObjectId(delete_success.value.file_id)
      })
        .then(function(delete_file_success) {
          console.log(delete_file_success)
          // Find all questions related to course material
          sec_collection.find({
            material: req.body.course_material_id
          }).toArray()
            .then(function(found_questions) {
              if (found_questions && found_questions.length > 0) {
                // Find all answers related to questions related to course material
                questions = found_questions;
                var find_answer_array = [];
                _.forEach(found_questions, function(find_answer) {
                  find_answer_array.push(thi_collection.find({ question: find_answer._id.toString() + '' }).toArray());
                })
                // Resolve all promises to get an array of array of answers
                Promise.all(find_answer_array)
                  .then(function(values) {
                    // Flatten out array of answers
                    var answers = [].concat.apply([], values);
                    // Delete all answers questions associated with course material
                    var delete_array = [];
                    _.forEach(answers, function(answer) {
                      delete_array.push(thi_collection.remove({ _id: ObjectId(answer._id) }));
                      delete_array.push(fou_collection.remove({ answer: answer._id.toString() + '' }));
                      delete_array.push(fif_collection.remove({ answer: answer._id.toString() + '' }));
                    })
                    // Delete all questions associated with course material
                    _.forEach(questions, function(question) {
                      delete_array.push(sec_collection.remove({ _id: ObjectId(question._id) }));
                    })
                    // Resolve all promises before returning response
                    Promise.all(delete_array)
                      .then(function(delete_success) {
                        return res.status(200).json({
                          status: 'OK',
                          message: 'Successfully deleted course material and associated questions and answers'
                        })
                      })
                      .catch(function(delete_fail) {
                        console.log(delete_fail);
                        return res.status(500).json({
                          status: 'error',
                          error: 'Failed to delete questions and answers of course material'
                        })
                      })
                  })
                  .catch(function(find_answers_fail) {
                    console.log(find_answers_fail);
                    return res.status(500).json({
                      status: 'error',
                      error: 'Failed to find answers of questions of course material to delete'
                    })
                  })
              }
              // return so front end can trigger
              return res.status(200).json({
                status: 'ok',
                message: "Successfully Deleted Material.",
                data: {}
              })
            })
            .catch(function(found_questions_fail) {
              console.log(found_questions_fail);
              return res.status(500).json({
                status: 'error',
                error: 'Failed to find questions of course material to delete'
              })
            })
        })
        .catch(function(delete_file_fail) {
          console.log(delete_file_fail);
          return res.status(500).json({
            status: 'error',
            error: 'Failed to delete file of course material'
          })
        })
    })
    .catch(function(delete_fail) {
      console.log(delete_fail);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to delete course material'
      })
    })
}

// Function to filter course material based on tags
exports.filter_material = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  // Finds all course materials of the course user is enrolled in and match tags
  var collection = db.get().collection('course_materials');
  collection.find({
    course_id: req.body.course_id,
    tags: { $all: req.body.filter }
  }).toArray()
    .then(function(filtered_materials) {
      return res.status(200).json({
        status: 'OK',
        message: 'Successfully loaded filtered material',
        materials: filtered_materials
      })
    })
    .catch(function(filtered_fail) {
      console.log(filtered_fail);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to load all filtered courses'
      })
    })
}


// Function to get course statistics
exports.get_course_stat = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  var count_course_materials = 0;
  var count_questions = 0;
  var count_answers = 0;

  // Query to count number of each items
  var collection = db.get().collection('course_materials');
  var sec_collection = db.get().collection('questions');
  var thi_collection = db.get().collection('answers');
  collection.find({
    course_id: req.params.id
  }).toArray()
    .then(function(found_materials) {
      // Count the number of course materials in the course
      count_course_materials = found_materials.length;
      var questions_array = [];
      _.forEach(found_materials, function(material) {
        questions_array.push(sec_collection.find({ material: material._id.toString() + '' }).toArray())
      })
      // Resolve all promises
      Promise.all(questions_array)
        .then(function(results) {
          // Count the number of questions in the course materials
          var found_questions = [].concat.apply([], results);
          count_questions = found_questions.length;
          var answers_array = [];
          _.forEach(found_questions, function(question) {
            answers_array.push(thi_collection.find({ question: question._id.toString() + '' }).toArray())
          })
          // Resolve all promises
          Promise.all(answers_array)
            .then(function(values) {
              var found_answers = [].concat.apply([], values);
              count_answers = found_answers.length;
              var statistics = {
                course_materials: count_course_materials,
                questions: count_questions,
                answers: count_answers
              }
              count_answers = values.length;
              return res.status(200).json({
                status: 'OK',
                message: 'Successfully retrieved coures statistics',
                statistics: statistics
              })
            })
            .catch(function(found_answers_fail) {
              console.log(found_answers_fail);
              return res.status(500).json({
                status: 'error',
                error: 'Failed to find answers for course statistics'
              })
            })
        })
        .catch(function(found_questions_fail) {
          console.log(found_questions_fail);
          return res.status(500).json({
            status: 'error',
            error: 'Failed to find questions for course statistics'
          })
        })
    })
    .catch(function(found_materials_fail) {
      console.log(found_materials_fail);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to find materials for course statistics'
      })
    })

}