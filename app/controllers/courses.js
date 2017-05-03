var moment = require('moment');
var db = require('../../db');
var stream = require('stream');
var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectId;
var _ = require('lodash');
var shortid = require('shortid');

var multer = require('multer');
var upload = multer().single('file');

exports.create_course = function(req, res) {

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

  var collection = db.get().collection('courses');

  collection.insert({
    name: req.body.name,
    department: req.body.department,
    code: req.body.code,
    section: req.body.section,
    password: req.body.password,
    description: req.body.description,
    professor: req.session.user
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

exports.edit_course = function(req, res) {

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
  console.log('courseToEdit: ')
  console.log(req.body);

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

exports.delete_course = function(req, res) {
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

  var collection = db.get().collection('courses');
  collection.remove({
    _id: ObjectId(req.params.id)
  })
    .then(function(remove_course_success) {
      return res.status(200).json({
        status: 'OK',
        message: 'Successfully deleted course'
      })
    })
    .catch(function(remove_course_fail) {
      return res.status(500).json({
        status: 'error',
        error: 'Failed to delete course'
      })
    })
}

exports.add_course = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  var collection = db.get().collection('courses');
  var sec_collection = db.get().collection('enrolled_in');

  collection.findOne({
    department: req.body.department,
    code: req.body.code,
    section: req.body.section,
    password: req.body.password
  })
    .then(function(course) {

      console.log("course found in colllection:");
      console.log(course);

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

              console.log("inserting into enrolledIn collection");
              console.log(course);

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

exports.load_enrolled_courses = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

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

exports.load_taught_courses = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

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

  console.log("loading_course with request:");
  // console.log(req.query.id);
  console.log(req.params);

  var collection = db.get().collection('courses');
  var sec_collection = db.get().collection('course_material');
  var thi_collection = db.get().collection('questions');

  collection.findOne({
    _id: ObjectId(req.params.id)
  })
    .then(function(course) {

      console.log("course loaded:");
      console.log(course);

      if (course) {
        obj.course = course;
        sec_collection.find({
          course_id: req.params.id
        }).toArray()
          .then(function(course_materials) {

            obj.course_materials = course_materials;
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

  upload(req, res, function(err) {
    if (err) {
      console.log(err);
      return res.status(404).json({
        status: 'Failed to upload file'
      })
    } else {

      var bufferStream = new stream.PassThrough();
      var bucket =  new mongodb.GridFSBucket(db.get());

      bufferStream.end(req.file.buffer);
      var buck = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype
      });

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

  var bufferStream = new stream.PassThrough();
  var bucket = new mongodb.GridFSBucket(db.get());

  var file_id = req.params.id;
  var buck = bucket.openDownloadStream(ObjectId(file_id));

  var buffer = "";

  buck.pipe(bufferStream)
    .on('error', function(error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to load file'
      })
    })
    .on('data', function(chunk) {
      
      if (buffer == "") {
        buffer = chunk
      } else {
        buffer = Buffer.concat([buffer, chunk]);
      }

    })
    .on('end', function() {

      var collection = db.get().collection('fs.files');

      collection.findOne({
        _id: ObjectId(file_id)
      })
        .then(function(file_data) {
          res.set('Content-Type', file_data.contentType);
          res.header('Content-Type', file_data.contentType);

          res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-disposition': 'attachment;filename=' + file_data.filename,
            'Content-Length': buffer.length
          });
          res.end(new Buffer(buffer, 'binary'));
        })
        .catch(function(file_data_err) {
          console.log(file_data_err);
          return res.status(500).json({
            status: 'error',
            error: 'Failed to find file data'
          })
        })

    })

}

exports.add_material = function(req, res) {

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
        collection.insert({
          file_id: req.body.file_id,
          mimetype: req.body.mimetype,
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

exports.edit_material = function(req, res) {
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

exports.delete_material = function(req, res) {
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

  var collection = db.get().collection('course_material');
  collection.remove({
    _id: ObjectId(req.body.course_material_id)
  })
    .then(function(delete_success) {
      return res.status(200).json({
        status: 'OK',
        message: 'Successfully deleted course material'
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

exports.delete_file = function(req, res) {
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
  } else if (client == null) {
    return res.status(500).json({
      status: 'error',
      error: 'Cassandra error'
    })
  }

  var file_id = req.params.id;

  var query = 'DELETE FROM material WHERE file_id = ?';
  client.execute(query, [file_id], function(err, result) {
    if (err) {
      console.log(err);
      return res.status(500).json({
        status: 'error',
        error: 'Unable to delete course material file'
      })
    } else {
      return res.status(200).json({
        status: 'OK',
        message: 'Successfully deleted course material file'
      })
    }
  })
}
