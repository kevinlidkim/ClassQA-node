var moment = require('moment');
var db = require('../../db');
var ObjectId = require('mongodb').ObjectId;
var _ = require('lodash');
var shortid = require('shortid');

var cassandra = require('cassandra-driver');
var client = new cassandra.Client({ contactPoints: ['127.0.0.1'], keyspace: 'classqa' });
var multer = require('multer');
var upload = multer().single('content');

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

  // console.log("inserting new course into collection: ");
  // console.log(req.body);

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

  var course_password = shortid.generate();

  var collection = db.get().collection('courses');
  collection.update({
    _id: ObjectId(req.body.course.id)
  },
  {
    name: req.body.course.name,
    department: req.body.course.department,
    code: req.body.course.code,
    section: req.body.course.section,
    password: req.body.course.password,
    description: req.body.course.description
  })
    .then(function(course) {
      return res.status(200).json({
        status: 'OK',
        message: 'Successfully created course',
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

exports.add_course = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  var collection = db.get().collection('courses');
  var sec_collection = db.get().collection('enrolled_in');

  // console.log("looking into collection:");
  // console.log(req.body);

  collection.findOne({
    department: req.body.department,
    code: req.body.code,
    section: req.body.section,
    password: req.body.password
  })
    .then(function(course) {

      // console.log("course found in colllection:");
      // console.log(course);

      if (course) {
        sec_collection.findOne({
          student: req.session.user,
          department: req.body.department,
          code: req.body.code,
          section: req.body.section
        })
          .then(function(enrolled_relation) {
            if (enrolled_relation) {
              return res.status(500).json({
                status: 'error',
                error: 'User already enrolled in course'
              })
            } else {
              sec_collection.insert({
                student: req.session.user,
                course_id: course._id,
                department: req.body.department,
                code: req.body.code,
                section: req.body.section
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

  var collection = db.get().collection('courses');
  var sec_collection = db.get().collection('course_material');
  var thi_collection = db.get().collection('questions');
  collection.findOne({
    _id: ObjectId(req.params.id)
  })
    .then(function(course) {

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
  } else if (client == null) {
    return res.status(500).json({
      status: 'error',
      error: 'Cassandra error'
    })
  }

  upload(req, res, function(err) {
    if (err) {
      console.log(err);
      return res.status(404).json({
        status: 'Failed to upload file'
      })
    } else {
      var file_id = shortid.generate();
      var query = 'INSERT INTO material (file_id, content, mimetype) VALUES (?, ?, ?)';

      client.execute(query, [file_id, req.file.buffer, req.file.mimetype], function(err, result) {
        if (err) {
          console.log(err);
          return res.status(404).json({
            status: 'error',
            error: "Couldn't deposit file"
          })
        } else {
          return res.status(200).json({
            status: 'OK',
            message: 'Successfully deposited file',
            id: file_id
          })
        }
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
  } else if (client == null) {
    return res.status(500).json({
      status: 'error',
      error: 'Cassandra error'
    })
  } else if (!req.params.id) {
    return res.status(500).json({
      status: 'error',
      error: 'Invalid course material id'
    })
  }

  var file_id = req.params.id;
  var query = 'SELECT content, mimetype FROM material WHERE file_id = ?';

  client.execute(query, [file_id], function(err, result) {
    if (err) {
      console.log(err);
      return res.status(404).json({
        status: "Couldn't retrieve file"
      })
    } else {
      var data = result.rows[0].content;
      var mimetype = result.rows[0].mimetype;

      res.set('Content-Type', mimetype);
      res.header('Content-Type', mimetype);

      res.writeHead(200, {
        'Content-Type': mimetype,
        'Content-disposition': 'attachment;filename=' + file_id,
        'Content-Length': data.length
      });
      res.end(new Buffer(data, 'binary'));
      // try res.sendfile(data) if doesnt work?
    }
  })

}

exports.add_material = function(req, res) {
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
          file: req.body.file_id,
          course: req.body.course_id,
          name: req.body.material_name,
          description: req.body.material_description
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
  // we should implement this
}

exports.delete_material = function(req, res) {
  // we should implement this
}
