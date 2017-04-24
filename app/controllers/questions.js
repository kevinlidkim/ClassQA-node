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
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  var collection = db.get().collection('questions');

  if (req.session.professor) {
    collection.update(
      { _id: ObjectId(req.body.question_id) },
      { body: req.body.body,
        timestamp: moment().format("MMMM do YYYY, h:mm:ss a") }
    )
      .then(function(update_success) {
        return res.status(200).json({
          status: 'OK',
          message: 'Successfully edited question as professor'
        })
      })
      .catch(function(update_fail) {
        console.log(update_fail);
        return res.status(500).json({
          status: 'error',
          error: 'Failed to edit question as professor'
        })
      })
  } else {
    collection.findOne({
      _id: ObjectId(req.body.question_id)
    })
      .then(function(question_found) {
        if (question_found) {
          if (question_found.poster == req.session.user) {
            collection.update(
              { _id: ObjectId(req.body.answer_id) },
              { body: req.body.body,
                timestamp: mmoment().format("MMMM do YYYY, h:mm:ss a") }
            )
              .then(function(update_success) {
                return res.status(200).json({
                  status: 'OK',
                  message: 'Successfully edited question as student'
                })
              })
              .catch(function(update_fail) {
                console.log(update_fail);
                return res.status(500).json({
                  status: 'error',
                  message: 'Failed to edit question as student'
                })
              })
          } else {
            return res.status(500).json({
              status: 'error',
              error: 'You do not have permission to edit this question'
            })
          }
        } else {
          return res.status(500).json({
            status: 'error',
            error: 'Question to edit does not exist'
          })
        }
      })
      .catch(function(question_failed) {
        console.log(question_failed);
        return res.status(500).json({
          status: 'error',
          error: 'Failed to find question to edit'
        })
      })
  }
}

exports.delete_question = function(req, res) {
  // ** for build 3
  // professors should be able to delete questions in courses they teach
  // **** only for professors?
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  var answers = [];

  var collection = db.get().collection('questions');
  var sec_collection = db.get().collection('answers');

  // easiest way to implement this would be to delete the question, 
  // return an array of all answers associated with this question, 
  // and send multiple request to delete answers from frontend

  if (req.session.professor) {
    sec_collection.find({
      question: req.body.question_id
    }).toArray()
      .then(function(answers_found) {
        answers = answers_found;
        collection.remove({
          _id: ObjectId(req.body.question_id);
        })
          .then(function(delete_success) {
            return res.status(200).json({
              status: 'OK',
              message: 'Successfully deleted question as professor',
              answers: answers
            })
          })
          .catch(function(delete_fail) {
            console.log(delete_fail);
            return res.status(500).json({
              status: 'error',
              error: 'Failed to delete question as professor'
            })
          })
      })
      .catch(function(answers_fail) {
        console.log(answers_fail);
        return res.status(500).json({
          status: 'error',
          error: 'Failed to find answers of question to delete as professor'
        })
      })
    } else {
      collection.find({
        _id: ObjectId(req.body.question_id)
      })
        .then(function(question_found) {
          if (question_found) {
            if (question_found.poster == req.session.user) {
              sec_collection.find({
                question: req.body.question_id
              }).toArray()
                .then(function(answers_found) {
                  answers = answers_found;
                  collection.remove({
                    _id: ObjectId(req.body.question_id);
                  })
                    .then(function(delete_success) {
                      return res.status(200).json({
                        status: 'OK',
                        message: 'Successfully deleted questions',
                        answers: answers
                      })
                    })
                    .catch(function(delete_fail) {
                      console.log(delete_fail);
                      return res.status(500).json({
                        status: 'error',
                        error: 'Failed to delete question'
                      })
                    })
                })
                .catch(function(answers_fail) {
                  console.log(answers_fail);
                  return res.status(500).json({
                    status: 'error',
                    error: 'Failed to find answers of question to delete'
                  })
                })
            } else {
              return res.status(500).json({
                status: 'error',
                error: 'You do not have permission to delete this question'
              })
            }
          } else {
            return res.status(500).json({
              status: 'error',
              error: 'Question to delete does not exist'
            })
          }
        })
        .catch(function(question_fail) {
          console.log(question_fail);
          return res.status(500).json({
            status: 'error',
            error: 'Failed to find question to delete'
          })
        })
    }
  
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
    timestamp: moment().format("MMMM Do YYYY, h:mm:ss a"),
    endorse: null,
    upvotes: 0
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
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  var collection = db.get().collection('answers');

  if (req.session.professor) {
    collection.update(
      { _id: ObjectId(req.body.answer_id) },
      { answer: req.body.body,
        timestamp: moment().format("MMMM do YYYY, h:mm:ss a") }
    )
      .then(function(update_success) {
        return res.status(200).json({
          status: 'OK',
          message: 'Successfully edited answer as professor'
        })
      })
      .catch(function(update_fail) {
        console.log(update_fail);
        return res.status(500).json({
          status: 'error',
          error: 'Failed to edit answer as professor'
        })
      })
  } else {
    collection.findOne({
      _id: ObjectId(req.body.answer_id)
    })
      .then(function(answer_found) {
        if (answer_found) {
          if (answer_found.poster == req.session.user) {
            collection.update(
              { _id: ObjectId(req.body.answer_id) },
              { answer: req.body.body,
                timestamp: mmoment().format("MMMM do YYYY, h:mm:ss a") }
            )
              .then(function(update_success) {
                return res.status(200).json({
                  status: 'OK',
                  message: 'Successfully edited answer as student'
                })
              })
              .catch(function(update_fail) {
                console.log(update_fail);
                return res.status(500).json({
                  status: 'error',
                  message: 'Failed to edit answer as student'
                })
              })
          } else {
            return res.status(500).json({
              status: 'error',
              error: 'You do not have permission to edit this answer'
            })
          }
        } else {
          return res.status(500).json({
            status: 'error',
            error: 'Answer to edit does not exist'
          })
        }
      })
      .catch(function(answer_failed) {
        console.log(answer_failed);
        return res.status(500).json({
          status: 'error',
          error: 'Failed to find answer to edit'
        })
      })
  }

}

exports.delete_answer = function(req, res) {
  // ** for build 3
  // professors should be able to delete answers in courses they teach
  // **** only for professors?
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  var collection = db.get().collection('answers');
  var sec_collection = db.get().collection('upvotes');
  var thi_collection = db.get().collection('endorse');

  if (req.session.professor) {
    collection.remove({ 
      _id: ObjectId(req.body.answer_id) 
    })
      .then(function(delete_success) {
        sec_collection.remove({
          _id: ObjectId(req.body.answer_id)
        })
          .then(function(delete_upvote_success) {
            thi_collection.remove({
              _id: ObjectId(req.body.answer_id);
            })
              .then(function(delete_endorse_success) {
                return res.status(200).json({
                  status: 'OK',
                  message: 'Successfully deleted answer as professor'
                })
              })
              .catch(function(delete_endorse_fail) {
                console.log(delete_endorse_fail);
                return res.status(500).json({
                  status: 'error',
                  error: 'Failed to delete endorsement as professor'
                })
              })
          })
          .catch(function(delete_upvote_fail) {
            console.log(delete_upvote_fail);
            return res.status(500).json({
              status: 'error',
              error: 'Failed to delete upvotes as professor'
            })
          })
      })
      .catch(function(delete_fail) {
        console.log(delete_fail);
        return res.status(500).json({
          status: 'error',
          error: 'Failed to delete answer as professor'
        })
      })
  } else {
    collection.findOne({
      _id: ObjectId(req.body.answer_id)
    })
      .then(function(answer_found) {
        if (answer_found) {
          if (answer_found.poster == req.session.user) {
            collection.remove({ 
              _id: ObjectId(req.body.answer_id) 
            })
              .then(function(delete_success) {
                sec_collection.remove({
                  _id: ObjectId(req.body.answer_id)
                })
                  .then(function(delete_upvote_success) {
                    thi_collection.remove({
                      _id: ObjectId(req.body.answer_id);
                    })
                      .then(function(delete_endorse_success) {
                        return res.status(200).json({
                          status: 'OK',
                          message: 'Successfully deleted answer as student'
                        })
                      })
                      .catch(function(delete_endorse_fail) {
                        console.log(delete_endorse_fail);
                        return res.status(500).json({
                          status: 'error',
                          error: 'Failed to delete endorsement as student'
                        })
                      })
                  })
                  .catch(function(delete_upvote_fail) {
                    console.log(delete_upvote_fail);
                    return res.status(500).json({
                      status: 'error',
                      error: 'Failed to delete upvotes as student'
                    })
                  })
              })
              .catch(function(delete_fail) {
                console.log(delete_fail);
                return res.status(500).json({
                  status: 'error',
                  message: 'Failed to delete answer as student'
                })
              })
          } else {
            return res.status(500).json({
              status: 'error',
              error: 'You do not have permission to delete this answer'
            })
          }
        } else {
          return res.status(500).json({
            status: 'error',
            error: 'Answer to delete does not exist'
          })
        }
      })
      .catch(function(answer_failed) {
        console.log(answer_failed);
        return res.status(500).json({
          status: 'error',
          error: 'Failed to find answer to delete'
        })
      })
  }
}

exports.upvote_answer = function(req, res) {
  // ** for build 3
  // students and professors can upvote answers
  // create upvote relationship
  // **** should i create an array and add upvotes there? or just manually create relationships for all?
  // **** must be deleted on answer deletion
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  var collection = db.get().collection('upvotes');
  var sec_collection = db.get().collection('answers');

  collection.findOne({
    user: req.session.user,
    answer: req.body.answer_id
  })
    .then(function(upvote_found) {
      if (upvote_found) {
        collection.remove({
          user: req.session.user,
          answer: req.body.answer_id
        })
          .then(function(downvote_relationship) {
            sec_collection.update(
              { _id: ObjectId(req.body.answer_id) },
              { $inc: { upvotes: -1 } }
            )
              .then(function(downvote_success) {
                return res.status(200).json({
                  status: 'OK',
                  message: 'Successfully downvoted answer'
                })
              })
              .catch(function(downvote_fail) {
                console.log(downvote_fail);
                return res.status(500).json({
                  status: 'error',
                  error: 'Failed to downvote answer'
                })
              })
          })
          .catch(function(downvote_relationship_fail) {
            console.log(downvote_relationship_fail)
            return res.status(500).json({
              status: 'error',
              error: 'Failed to remove upvote relationship'
            })
          })
      } else {
        collection.insert({
          user: req.session.user,
          answer: req.body.answer_id
        })
          .then(function(upvote_relationship) {
            sec_collection.update(
              { _id: ObjectId(req.body.answer_id) },
              { $inc: { upvotes: 1} }
            )
              .then(function(upvote_success) {
                return res.status(200).json({
                  status: 'OK',
                  message: 'Successfully upvoted answer'
                })
              })
              .catch(function(upvote_fail) {
                console.log(upvote_fail);
                return res.status(500).json({
                  status: 'error',
                  error: 'Failed to upvote answer'
                })
              })
          })
          .catch(function(upvote_relationship_fail) {
            console.log(upvote_relationship_fail);
            return res.status(500).json({
              status: 'error',
              error: 'Failed to create upvote relationship'
            })
          })
      }
    })
    .catch(function(upvote_found_fail) {
      console.log(upvote_found_fail);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to find upvote'
      })
    })
}

exports.endorse_answer = function(req, res) {
  // ** for build 3
  // only professors can endorse answers
  // create endorse relationship
  // **** must be deleted on answer deletion
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  } else if (!req.session.professor) {
    return res.status(401).json({
      status: 'error',
      error: 'You are not authorized to endorse answer'
    })
  }

  var collection = db.get().collection('endorse');
  var sec_collection = db.get().collection('answers');

  collection.findOne({
    user: req.session.user,
    answer: req.body.answer_id
  })
    .then(function(relation_found) {
      if (relation_found) {
        return res.status(500).json({
          status: 'error',
          error: 'Answer already endorsed'
        })
      } else {
        collection.insert({
          answer: req.body.answer_id,
          user: req.session.user
        })
          .then(function(endorse_success) {
            collection.update(
              { _id: ObjectId(req.body.answer_id) },
              { endorse: req.session.user }
            )
              .then(function(endorse_update) {
                return res.status(200).json({
                  status: 'OK',
                  message: 'Successfully endorsed answer'
                })
              })
              .catch(function(endorse_update_fail) {
                console.log(endorse_update_fail);
                return res.status(500).json({
                  status: 'error',
                  error: 'Failed to update answers with endorsement'
                })
              })
          })
          .catch(function(endorse_fail) {
            console.log(endorse_fail);
            return res.status(500).json({
              status: 'error',
              error: 'Failed to endorse answer'
            })
          })
      }
    })
    .catch(function(answer_failed) {
      console.log(answer_failed);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to find answer to endorse'
      })
    })
}

exports.show_answers = function(req, res) {
  // ** for build 3
  // show all answers for current question
  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  var collection = db.get().collection('answers');

  collection.find({
    question: req.body.question_id
  }).toArray()
    .then(function(answers_found) {
      if (answers_found && answers_found.length > 0) {
        return res.status(200).json({
          status: 'OK',
          message: 'Successfully found all answers for selected question',
          answers: answers_found
        })
      } else {
        return res.status(200).json({
          status: 'OK',
          message: 'There are currently no answers for selected question'
        })
      }
    })
    .catch(function(answers_fail) {
      console.log(answers_fail);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to find answers from question id'
      })
    })
}

exports.hide_answers = function(req, res) {
  // ** for build 3
  // we can just delete the array in our frontend. no need to implement backend
}
