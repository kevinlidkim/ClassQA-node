var moment = require('moment');
var db = require('../../db');
var ObjectId = require('mongodb').ObjectId;
var _ = require('lodash');
var shortid = require('shortid');

exports.load_questions = function(req, res) {
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  var collection = db.get().collection('questions');
  collection.find({
    material: req.params.id
  }).toArray()
    .then(function(questions) {
      return res.status(200).json({
        status: 'OK',
        message: 'Successfully retrieved all questions from course material id',
        data: questions
      })
    })
    .catch(function(err) {
      console.log(err);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to find questions from course material id'
      })
    })
}

exports.ask_question = function(req, res) {
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  var collection = db.get().collection('questions');
  collection.insert({
    poster: req.session.user,
    body: req.body.body,
    material: req.body.material_id,
    timestamp: moment().format("MMMM Do YYYY, h:mm:ss a")
  })
    .then(function(question) {
      return res.status(200).json({
        status: 'OK',
        message: 'Successfully asked question'
      })
    })
    .catch(function(err) {
      console.log(err);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to ask question'
      })
    })

}

exports.edit_question = function(req, res) {
  // ** for build 3
  // professors should be able to edit questions in courses they teach
}

exports.delete_question = function(req, res) {
  // ** for build 3
  // professors should be able to delete questions in courses they teach
  // **** only for professors?
}

exports.answer_question = function(req, res) {
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  var collection = db.get().collection('answers');
  collection.insert({
    poster: req.session.user,
    answer: req.body.body,
    question: req.body.question_id,
    timestamp: moment().format("MMMM Do YYYY, h:mm:ss a")
  })
    .then(function() {
      return res.status(200).json({
        status: 'OK',
        message: 'Successfully answered question'
      })
    })
    .catch(function(err) {
      console.log(err);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to answer question'
      })
    })
}

exports.edit_answer = function(req, res) {
  // ** for build 3
  // professors should be able to edit answers in courses they teach
}

exports.delete_answer = function(req, res) {
  // ** for build 3
  // professors should be able to delete answers in courses they teach
  // **** only for professors?
}

exports.upvote_answer = function(req, res) {
  // ** for build 3
  // students and professors can upvote answers
  // create upvote relationship
  // **** should i create an array and add upvotes there? or just manually create relationships for all?
  // **** must be deleted on answer deletion
}

exports.endorse_answer = function(req, res) {
  // ** for build 3
  // only professors can endorse answers
  // create endorse relationship
  // **** must be deleted on answer deletion
}

exports.show_answers = function(req, res) {
  // ** for build 3
  // show all answers for current question
}

exports.hide_answers = function(req, res) {
  // ** for build 3
  // we can just delete the array in our frontend. no need to implement backend
}
