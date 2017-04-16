var moment = require('moment');
var db = require('../../db');
var ObjectId = require('mongodb').ObjectId;
var _ = require('lodash');
var shortid = require('shortid');

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

  var course_password = shortid.generate();

  var collection = db.get().collection('courses');
  collection.insert({
    name: req.body.course.name,
    department: req.body.course.department,
    code: req.body.course.code,
    section: req.body.course.section,
    password: course_password,
    description: req.body.course.description,
    professor: req.session.user
  })
    .then(function(course) {
      return res.status(200).json({
        status: 'OK',
        message: 'Successfully created course',
        password: course_password
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
    description: req.body.course.description
  })
    .then(function(course) {
      return res.status(200).json({
        status: 'OK',
        message: 'Successfully created course',
        password: course_password
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
  
  collection.findOne({
    department: req.body.course.department,
    code: req.body.course.code,
    section: req.body.course.section,
    password: course_password
  })
    .then(function(course) {
      if (course) {
        sec_collection.findOne({
          student: req.session.user,
          department: req.body.course.department,
          code: req.body.course.code,
          section: req.body.course.section
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
                department: req.body.course.department,
                code: req.body.course.code,
                section: req.body.course.section
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

exports.load_course = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  var collection = db.get().collection('courses');
  collection.findOne({
    _id: ObjectId(req.params.id)
  })
    .then(function(course) {
      // need to implement
      // load all question topics and material for course
      if (course) {
        return res.status(200).json({
          status: 'OK',
          message: 'Successfully loaded course',
          course: course
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

exports.add_material = function(req, res) {
  // use cassandra for this
  // create a "course material" document
}

exports.edit_material = function(req, res) {
  // we should implement this
}

exports.delete_material = function(req, res) {
  // we should implement this
}
