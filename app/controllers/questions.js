// Importing necessary modules
var moment = require('moment-timezone');
var db = require('../../db');
var ObjectId = require('mongodb').ObjectId;
var _ = require('lodash');
var shortid = require('shortid');
var nodemailer = require('nodemailer');

// Function to load all questions of a given course material
exports.load_questions = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  // Load up questions from passed in course material id
  var collection = db.get().collection('questions');
  collection.find({
    material: req.params.id
  }).sort({timestamp: -1}).limit(10).toArray()
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

// Function for users to ask a question
exports.ask_question = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  // Create a question object and add it to the database
  var collection = db.get().collection('questions');
  collection.insert({
    poster: req.session.user,
    body: req.body.body,
    material: req.body.material_id,
    timestamp: moment().tz('America/New_York').format("MMMM Do YYYY, h:mm:ss a")
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

// Function for users to edit questions
exports.edit_question = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  // Check to see if user is a professor or not. Professors can edit questions
  var collection = db.get().collection('questions');
  if (req.session.professor) {
    collection.update(
      { _id: ObjectId(req.body.question_id) },
      { $set: { body: req.body.body,
                edited: true }
      }
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
    // Find the question so we can check to see if logged in user posted the question
    collection.findOne({
      _id: ObjectId(req.body.question_id)
    })
      .then(function(question_found) {
        if (question_found) {
          if (question_found.poster == req.session.user) {
            // Update the question in database if logged in user posted the question
            collection.update(
              { _id: ObjectId(req.body.question_id) },
              {$set: { body: req.body.body,
                      edited: true }
              }
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

// Function to delete a question
exports.delete_question = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  } else if (req.params.id.length != 24) {
    return res.status(500).json({
      status: 'error',
      error: 'Invalid question id'
    })
  }

  // Check to see if user is a professor or not. Professors can delete questions
  var collection = db.get().collection('questions');
  var sec_collection = db.get().collection('answers');
  var thi_collection = db.get().collection('upvotes');
  var fou_collection = db.get().collection('endorse');
  if (req.session.professor) {
    collection.remove({
      _id: ObjectId(req.params.id)
    })
      .then(function(remove_question_success) {
        // Find all answers for the question deleted
        sec_collection.find({
          question: req.params.id
        }).toArray()
          .then(function(answers_found) {
            // Delete all answers and their relationships with the deleted question
            var remove_answer_array = [];
            _.forEach(answers_found, function(remove_answer) {
              remove_answer_array.push(fou_collection.remove({ answer: remove_answer._id.toString() + '' }));
              remove_answer_array.push(thi_collection.remove({ answer: remove_answer._id.toString() + '' }));
              remove_answer_array.push(sec_collection.remove({ _id: ObjectId(remove_answer._id) }));
            })
            // Resolve all promises before returning response
            Promise.all(remove_answer_array)
              .then(function(remove_answer_success) {
                return res.status(200).json({
                  status: 'OK',
                  message: 'Successfully deleted questions and associated answers as professor'
                })
              })
              .catch(function(remove_answer_fail) {
                console.log(remove_answer_fail);
                return res.status(500).json({
                  status: 'error',
                  error: 'Failed to delete associated answers from question to remove as professor'
                })
              })
          })
          .catch(function(answers_found_fail) {
            console.log(answers_found_fail);
            return res.status(500).json({
              status: 'error',
              error: 'Failed to find associated answers from question to remove as professor'
            })
          })
      })
      .catch(function(remove_question_fail) {
        console.log(remove_question_fail);
        return res.status(500).json({
          status: 'error',
          error: 'Failed to remove question as professor'
        })
      })
  } else {
    // Find the question to check to see if logged in user posted the question
    collection.findOne({
      _id: ObjectId(req.body.question_id)
    })
      .then(function(question_found) {
        if (question_found) {
          if (question_found.poster == req.session.user) {
            // Delete the question from the database if logged in user posted the question
            collection.remove({
              _id: ObjectId(req.body.question_id)
            })
              .then(function(remove_question_success) {
                // Find all answers for the question deleted
                sec_collection.find({
                  question: req.body.question_id
                }).toArray()
                  .then(function(answers_found) {
                    // Delete all answers and their relationships with the deleted question
                    var remove_answer_array = [];
                    _.forEach(answers_found, function(remove_answer) {
                      remove_answer_array.push(fou_collection.remove({ answer: remove_answer._id.toString() + '' }));
                      remove_answer_array.push(thi_collection.remove({ answer: remove_answer._id.toString() + '' }));
                      remove_answer_array.push(sec_collection.remove({ _id: ObjectId(remove_answer._id) }));
                    })
                    Promise.all(remove_answer_array)
                      .then(function(remove_answer_success) {
                        return res.status(200).json({
                          status: 'OK',
                          message: 'Successfully deleted questions and associated answers as user'
                        })
                      })
                      .catch(function(remove_answer_fail) {
                        console.log(remove_answer_fail);
                        return res.status(500).json({
                          status: 'error',
                          error: 'Failed to delete associated answers from question to remove as user'
                        })
                      })
                  })
                  .catch(function(answers_found_fail) {
                    console.log(answers_found_fail);
                    return res.status(500).json({
                      status: 'error',
                      error: 'Failed to find associated answers from question to remove as user'
                    })
                  })
              })
              .catch(function(remove_question_fail) {
                console.log(remove_question_fail);
                return res.status(500).json({
                  status: 'error',
                  error: 'Failed to remove question as user'
                })
              })
          } else {
            return res.status(401).json({
              status: 'error',
              error: 'You are not authorized to delete this question'
            })
          }
        } else {
          return res.status(500).json({
            status: 'error',
            error: 'Question does not exist'
          })
        }
      })
  }
}

// Function for users to answer questions
exports.answer_question = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  // Create an answer object and store it in the database
  var collection = db.get().collection('answers');
  collection.insert({
    poster: req.session.user,
    answer: req.body.body,
    question: req.body.question_id,
    timestamp: moment().tz('America/New_York').format("MMMM Do YYYY, h:mm:ss a"),
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

// Function for users to edit their questions
exports.edit_answer = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  // Check to see if logged in user is a professor or not. Professors can edit answers
  var collection = db.get().collection('answers');
  if (req.session.professor) {
    collection.update(
      { _id: ObjectId(req.body.answer_id) },
      { $set: { answer: req.body.body,
                edited: true }
      }
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
    // Find the answer in the database to check to see if logged in user posted it
    collection.findOne({
      _id: ObjectId(req.body.answer_id)
    })
      .then(function(answer_found) {
        if (answer_found) {
          if (answer_found.poster == req.session.user) {
            // Update answer if logged in user posted it
            collection.update(
              { _id: ObjectId(req.body.answer_id) },
              { $set: { answer: req.body.body,
                        edited: true }
              }
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

// Function to delete answers
exports.delete_answer = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  } else if (req.params.id.length != 24) {
    return res.status(500).json({
      status: 'error',
      error: 'Invalid media id'
    })
  }

  // Check to see if logged in user is a professor. Professors can delete answers
  var collection = db.get().collection('answers');
  var sec_collection = db.get().collection('upvotes');
  var thi_collection = db.get().collection('endorse');
  if (req.session.professor) {
    collection.remove({
      _id: ObjectId(req.params.id)
    })
      .then(function(delete_success) {
        // Remove all upvote relationships with answer
        sec_collection.remove({
          answer: req.params.id
        })
          .then(function(delete_upvote_success) {
            // Remove all endorsement relationships with answer
            thi_collection.remove({
              answer: req.params.id
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
    // Find the answer to check to see if logged in user posted the answer
    collection.findOne({
      _id: ObjectId(req.params.id)
    })
      .then(function(answer_found) {
        if (answer_found) {
          if (answer_found.poster == req.session.user) {
            // Remove the answer if logged in user posted the answer
            collection.remove({
              _id: ObjectId(req.params.id)
            })
              .then(function(delete_success) {
                // Remove all upvote relationships with answer
                sec_collection.remove({
                  answer: req.params.id
                })
                  .then(function(delete_upvote_success) {
                    // Remove all endorsement relationships with answer
                    thi_collection.remove({
                      answer: req.params.id
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

// Function to upvote answers
exports.upvote_answer = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  // Check to see if user already upvoted answer
  var collection = db.get().collection('upvotes');
  var sec_collection = db.get().collection('answers');
  collection.findOne({
    user: req.session.user,
    answer: req.body.answer_id
  })
    .then(function(upvote_found) {
      // Remove upvote relationship if upvote is found
      if (upvote_found) {
        collection.remove({
          user: req.session.user,
          answer: req.body.answer_id
        })
          .then(function(downvote_relationship) {
            // Update the upvotes counter for the answer in the database
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
        // Create upvote relationship if upvote is not found
        collection.insert({
          user: req.session.user,
          answer: req.body.answer_id
        })
          .then(function(upvote_relationship) {
            // Update the upvotes counter for the answer in the database
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

// Function to check upvote answers
exports.check_upvote_answer = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  // Check to see if user already upvoted answer
  var collection = db.get().collection('upvotes');
  var sec_collection = db.get().collection('answers');
  collection.findOne({
    user: req.session.user,
    answer: req.body.answer_id
  })
    .then(function(upvote_found) {
      // Remove upvote relationship if upvote is found
      if (upvote_found) {
        return res.status(200).json({
          status: 'OK',
          message: 'Found upvote answer relation',
          found: true
        })
      } else {
        return res.status(200).json({
          status: 'OK',
          message: 'Did not found upvote answer relation',
          found: false
        })
      }
    })
    .catch(function(upvote_found_fail) {
      console.log(upvote_found_fail);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to find upvote answer relation'
      })
    })
}

// Function for professor to endorse answers
exports.endorse_answer = function(req, res) {

  // Check to see if logged in user is a professor
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

  // Check to see if answer is already endorsed by professor
  var collection = db.get().collection('endorse');
  var sec_collection = db.get().collection('answers');
  collection.findOne({
    user: req.session.user,
    answer: req.body.answer_id
  })
    .then(function(relation_found) {
      if (relation_found) {
        // Remove endorsement from answers if found
        sec_collection.update(
          { _id: ObjectId(req.body.answer_id) },
          { $set: { endorse: null } }
        )
          .then(function(endorse_remove_success) {
            // Remove endorsement relationship
            collection.remove({
              user: req.session.user,
              answer: req.body.answer_id
            })
              .then(function(endorse_relationship_remove) {
                return res.status(500).json({
                  status: 'error',
                  error: 'Answer already endorsed'
                })
              })
              .catch(function(endorse_relationship_fail) {
                console.log(endorse_relationship_fail)
                return res.status(500).json({
                  status: 'error',
                  error: 'Failed to remove endorsement relationship'
                })
              })
          })
          .catch(function(endorse_remove_fail) {
            console.log(endorse_remove_fail);
            return res.status(500).json({
              status: 'error',
              error: 'Failed to remove endorsement from answers'
            })
          })
      } else {
        // Create endorsement relationship if endorsement not found
        collection.insert({
          answer: req.body.answer_id,
          user: req.session.user
        })
          .then(function(endorse_success) {
            // Update the endorsement field for the answer in the database
            sec_collection.update(
              { _id: ObjectId(req.body.answer_id) },
              { $set: { endorse: req.session.user } }
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

// Function to load all answers of a given question
exports.load_answers = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  // Check to see if question has any answers
  var collection = db.get().collection('answers');
  collection.find({
    question: req.params.id
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

// Function to show the best answer to a given question
exports.show_best_answer = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  // Check to see if the question has a endorsed answer. Sort by descending order of upvotes
  var collection = db.get().collection('answers');
  collection.find({
    question: req.params.id,
    endorse: { $ne: null }
  }).sort({upvotes: -1}).limit(1).toArray()
    .then(function(endorsed_answer) {
      if (endorsed_answer && endorsed_answer.length > 0) {
        return res.status(200).json({
          status: 'OK',
          message: 'Successfully found best endorsed answer',
          answer: endorsed_answer[0]
        })
      } else {
        // Check to see if question has any answers. Sort by descending order of upvotes
        collection.find({
          question: req.params.id
        }).sort({upvotes: -1}).limit(1).toArray()
          .then(function(best_answer) {
            if (best_answer && best_answer.length > 0) {
              return res.status(200).json({
                status: 'OK',
                message: 'Successfully found best upvoted answer',
                answer: best_answer[0]
              })
            } else {
              return res.status(200).json({
                status: 'OK',
                message: 'Question does not have any answers yet'
              })
            }
          })
          .catch(function(best_answer_fail) {
            console.log(best_answer_fail);
            return res.status(500).json({
              status: 'error',
              error: 'Failed to find best answer'
            })
          })
      }
    })
    .catch(function(endorsed_answer_fail) {
      console.log(endorsed_answer_fail);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to find endorsed answer'
      })
    })
}

// Function for users to report a question
exports.report_question = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  var collection = db.get().collection('questions');
  var sec_collection = db.get().collection('course_materials');
  var thi_collection = db.get().collection('courses');

  var question = {};
  var material = {};
  var course = {};

  // Check to see if question exists in the database
  collection.findOne({
    _id: ObjectId(req.params.id)
  })
    .then(function(found_question) {
      if (found_question) {
        question = found_question;
        console.log(question);
        // Find all the course material the question is posted under
        sec_collection.findOne({
          _id: ObjectId(question.material)
        })
          .then(function(found_material) {
            if (found_material) {
              material = found_material;
              // Find the course the course material is posted under
              thi_collection.findOne({
                _id: ObjectId(material.course_id)
              })
                .then(function(found_course) {
                  if (found_course) {
                    course = found_course;
                    // Set up our email service
                    var transporter = nodemailer.createTransport({
                      service: 'gmail',
                      auth: {
                        user: 'classqa.cse308@gmail.com',
                        pass: 'cse308!@'
                      }
                    });
                    // Build the email text body

                    var text = "Question posted by " + question.poster + " has been reported." +
                                "\nBody of question is " + question.body +
                                "\nThe question is posted under material " + material.title;

                    // Set up the email options
                    var mail_options = {
                      from: '"ClassQA 👻" <classqa.cse308@gmail.com>', // sender address
                      to: course.course_email, // list of receivers
                      subject: 'ClassQA Question Report ✔', // Subject line
                      text: text, // plain text body
                      html: '<b>' + text + '</b>' // html body
                    };
                    // Send the email to the course email
                    transporter.sendMail(mail_options, (error, info) => {
                      if (!error) {
                        return res.status(200).json({
                          status: 'Successfully reported question to course email'
                        })
                      } else {
                        return res.status(500).json({
                          status: 'Unable to send to course email the question to report'
                        })
                      }
                    });
                  }
                })
                .catch(function(found_course_fail) {
                  console.log(found_course_fail);
                  return res.status(500).json({
                    status: 'error',
                    error: 'Failed to find course of material of question to report'
                  })
                })
            } else {
              return res.status(500).json({
                status: 'error',
                error: 'Question to report does not exist'
              })
            }
          })
          .catch(function(found_material_fail) {
            console.log(found_material_fail);
            return res.status(500).json({
              status: 'error',
              error: 'Failed to find material of question to report'
            })
          })
      } else {
        return res.status(500).json({
          status: 'error',
          error: 'Question to report does not exist'
        })
      }
    })
    .catch(function(found_question_fail) {
      console.log(found_question_fail);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to find question to report'
      })
    })
}

// Function for users to report an answer
exports.report_answer = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }

  var collection = db.get().collection('answers');
  var sec_collection = db.get().collection('questions');
  var thi_collection = db.get().collection('course_materials');
  var fou_collection = db.get().collection('courses');

  var answer = {};
  var question = {};
  var material = {};
  var course = {};

  // Check to see if answer exists
  collection.findOne({
    _id: ObjectId(req.params.id)
  })
    .then(function(found_answer) {
      if (found_answer) {
        answer = found_answer;
        // Find the question the answer is posted under
        sec_collection.findOne({
          _id: ObjectId(answer.question)
        })
          .then(function(found_question) {
            if (found_question) {
              question = found_question;
              // Find the course material the question is posted under
              thi_collection.findOne({
                _id: ObjectId(question.material)
              })
                .then(function(found_material) {
                  if (found_material) {

                    material = found_material;
                    // Find the course the course material is posted under
                    fou_collection.findOne({
                      _id: ObjectId(material.course_id)
                    })
                      .then(function(found_course) {
                        if (found_course) {
                          course = found_course;
                          // Set up our email service
                          var transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                              user: 'classqa.cse308@gmail.com',
                              pass: 'cse308!@'
                            }
                          });
                          // Build the email text body
                          var text = "Answer posted by " + answer.poster + " has been reported." +
                                      "\nBody of answer is " + question.answer +
                                      "\nThe answer is posted under question " + question.body +
                                      "\nThe question is posted under material " + material.title;

                          var mail_options = {
                            from: '"ClassQA 👻" <classqa.cse308@gmail.com>', // sender address
                            to: course.course_email, // list of receivers
                            subject: 'ClassQA Question Report ✔', // Subject line
                            text: text, // plain text body
                            html: '<b>' + text + '</b>' // html body
                          };
                          // Send the email to the course email
                          transporter.sendMail(mail_options, (error, info) => {
                            if (!error) {
                              return res.status(200).json({
                                status: 'Successfully created professor account'
                              })
                            } else {
                              return res.status(500).json({
                                status: 'Unable to send email for professor account'
                              })
                            }
                          });
                        }
                      })
                      .catch(function(found_course_fail) {
                        console.log(found_course_fail);
                        return res.status(500).json({
                          status: 'error',
                          error: 'Failed to find course of material of question to report'
                        })
                      })
                  } else {
                    return res.status(500).json({
                      status: 'error',
                      error: 'Answer to report does not exist'
                    })
                  }
                })
                .catch(function(found_material_fail) {
                  console.log(found_material_fail);
                  return res.status(500).json({
                    status: 'error',
                    error: 'Failed to find material of question to report'
                  })
                })
            } else {
              return res.status(500).json({
                status: 'error',
                error: 'Question to report does not exist'
              })
            }
          })
          .catch(function(found_question_fail) {
            console.log(found_question_fail);
            return res.status(500).json({
              status: 'error',
              error: 'Failed to find question to report'
            })
          })
      }
    })
    .catch(function(found_answer_fail) {
      console.log(found_answer_fail);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to find answer to report'
      })
    })

}

// Function to search for questions based on text
exports.search_question = function(req, res) {

  if (!req.session.user) {
    return res.status(500).json({
      status: 'error',
      error: 'No logged in user'
    })
  }
  // console.log("id: " + req.params.id);
  // console.log("query: " + req.body.query);

  var collection = db.get().collection('questions');
  collection.find({
    body: { $regex: req.body.query },
    material: req.params.id
  }).sort({timestamp: -1}).toArray()
    .then(function(found_questions) {
      return res.status(200).json({
        status: 'OK',
        message: 'Successfully queried for questions',
        data: found_questions
      })
    })
    .catch(function(found_questions_fail) {
      console.log(found_questions_fail);
      return res.status(500).json({
        status: 'error',
        error: 'Failed to search for questions by query'
      })
    })

}
