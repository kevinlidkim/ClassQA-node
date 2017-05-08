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
      password: req.body.password,
      description: req.body.description
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
  }

  var materials = [];
  var questions = [];

  // Remove the course by its id
  var collection = db.get().collection('courses');
  var sec_collection = db.get().collection('course_material');
  var thi_collection = db.get().collection('questions');
  var fou_collection = db.get().collection('answers');
  var fif_collection = db.get().collection('upvotes');
  var six_collection = db.get().collection('endorse');
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
            Promise.all(find_question_array, results => {
              // Flatten out array of questions
              var found_questions = [].concat.apply([], results);
              // Find all answers related to questions related to course material
              questions = found_questions;
              var find_answer_array = [];
              _.forEach(found_questions, function(find_answer) {
                find_answer_array.push(thi_collection.find({ question: find_answer._id.toString() + '' }).toArray());
              })
              // Resolve all promises to get an array of array of answers
              Promise.all(find_answer_array, values => {
                // Flatten out array of answers
                var answers = [].concat.apply([], values);
                // Delete all answers, questions, and course materials related to course
                var delete_array = [];
                _.forEach(answers, function(answer) {
                  delete_array.push(fou_collection.remove({ _id: ObjectId(answer._id) }));
                  delete_array.push(fif_collection.remove({ answer: answer._id.toString() + '' }));
                  delete_array.push(six_collection.remove({ answer: answer._id.toString() + '' }));
                })
                _.forEach(questions, function(question) {
                  delete_array.push(thi_collection.remove({ _id: ObjectId(question._id) }));
                })
                _.forEach(materials, function(material) {
                  delete_array.push(sec_collection.remove({ _id: ObjectId(material._id) }));
                })
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
  }

  var obj = {
    course: {},
    course_materials: [],
    questions: []
  }

  // Check to see if course exists
  var collection = db.get().collection('courses');
  var sec_collection = db.get().collection('course_material');
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


// Function for professors to upload files to the database
exports.upload_material = function(req, res) {
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

  // Check to see if file has been uploaded to server
  upload(req, res, function(err) {
    if (err) {
      console.log(err);
      return res.status(404).json({
        status: 'Failed to upload file'
      })
    } else {

      // Create a stream to pass the file buffer into the database
      var bufferStream = new stream.PassThrough();
      var bucket =  new mongodb.GridFSBucket(db.get());
      bufferStream.end(req.file.buffer);
      var buck = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype
      });

      // Pipe and store the file into the database
      bufferStream.pipe(buck)
        .on('error', function(error) {
          return res.status(500).json({
            status: 'error',
            error: 'Failed to upload file to mongo'
          })
        })
        .on('finish', function() {
          return res.status(200).json({
            status: 'OK',
            message: 'Successfully uploaded file',
            id: buck.id
          })
        })
    }
  })
}

// Function to retrieve file from database
exports.load_material = function(req, res) {
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  } else if (!req.params.id) {
    return res.status(500).json({
      status: 'error',
      error: 'Invalid course material id'
    })
  }

  // Check to see if file exists
  var file_id = req.params.id;
  var collection = db.get().collection('fs.files');
  collection.findOne({
    _id: ObjectId(file_id)
  })
    .then(function(file_data) {
      // Create a stream to pass file id into the database
      var bufferStream = new stream.PassThrough();
      var bucket = new mongodb.GridFSBucket(db.get());
      var buck = bucket.openDownloadStream(ObjectId(file_id));
      var buffer = "";

      // Pipe and retrieve file buffer from database
      buck.pipe(bufferStream)
        .on('error', function(error) {
          return res.status(500).json({
            status: 'error',
            message: 'Failed to load file'
          })
        })
        .on('data', function(chunk) {
          // Build buffer with chunks being read in
          if (buffer == "") {
            buffer = chunk
          } else {
            buffer = Buffer.concat([buffer, chunk]);
          }

        })
        .on('end', function() {
          // Return file with corresponding headers
          res.set('Content-Type', file_data.contentType);
          res.header('Content-Type', file_data.contentType);

          res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-disposition': 'attachment;filename=' + file_data.filename,
            'Content-Length': buffer.length
          });
          res.end(new Buffer(buffer, 'binary'));
        })  
    })
    .catch(function(file_data_err) {
      console.log(file_data_err);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to find file data'
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
  var collection = db.get().collection('course_material');
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
          description: req.body.description
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
  var collection = db.get().collection('course_material');
  collection.update(
    { _id: ObjectId(req.body.course_material_id) },
    { file_id: req.body.file_id,
      course_id: req.body.course_id,
      title: req.body.title,
      description: req.body.description }
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

  // Delete the course to file relationship
  var collection = db.get().collection('course_material');
  var sec_collection = db.get().collection('questions');
  var thi_collection = db.get().collection('answers');
  var fou_collection = db.get().collection('upvotes');
  var fif_collection = db.get().collection('endorse');
  collection.remove({
    _id: ObjectId(req.body.course_material_id)
  })
    .then(function(delete_success) {
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
            Promise.all(find_answer_array, values => {
              // Flatten out array of answers
              var answers = [].concat.apply([], values);
              // Delete all answers and questions associated with course material
              var delete_array = [];
              _.forEach(answers, function(answer) {
                delete_array.push(thi_collection.remove({ _id: ObjectId(answer._id) }));
                delete_array.push(fou_collection.remove({ answer: answer._id.toString() + '' }));
                delete_array.push(fif_collection.remove({ answer: answer._id.toString() + '' }));
              })
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
        })
        .catch(function(found_questions_fail) {
          console.log(found_questions_fail);
          return res.status(500).json({
            status: 'error',
            error: 'Failed to find questions of course material to delete'
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

// Function to delete uploaded file from database
exports.delete_file = function(req, res) {

  // Check to see if logged in user is a professor
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

  // Delete the file from the database
  var file_id = req.params.id;
  var bucket = new mongodb.GridFSBucket(db.get());
  bucket.delete(ObjectId(file_id), function(error) {
    if (error) {
      console.log(error);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to delete course material file'
      })
    } else {
      return res.status(200).json({
        status: 'OK',
        message: 'Successfully deleted course material file'
      })
    }
  })
}
