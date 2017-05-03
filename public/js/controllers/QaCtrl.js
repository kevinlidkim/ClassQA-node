angular.module('QaCtrl', []).controller('QaController', ['$scope', '$location', '$routeParams','moment', 'MainService', 'QaService', '$sce', function($scope, $location, $routeParams, moment, MainService, QaService, $sce) {

	$scope.material_id = "";
	$scope.material = {};
	$scope.questions = [];

	load_material = function(id) {

		// console.log('loading material with id: ' + id);

		return QaService.load_material(id)
			.then(function(data) {
				$scope.material_id = id;
				$scope.material = $sce.trustAsResourceUrl(data.fileURL);

				// console.log("opening material in a new window");
				// window.open($scope.material);

				// console.log("this is material_displaY: " + $scope.material);

			})
			.catch(function(err) {
				console.log(err);
			})

	}

	load_questions = function(id) {
		// console.log('loading questions in this material');
		return QaService.load_qa(id)
			.then(function(data) {
				$scope.questions = data.data.data;

				// Add an 'edit' property to each question, initialized as the question body
				$scope.questions.forEach(function(question) {
					question.edit = question.body;
				})

				console.log($scope.questions);

			})
			.catch(function(err) {
				console.log(err);
			})
	}

	$scope.ask_question = function() {
		var question = {
			body: $scope.ask_ques,
			material_id: $scope.material_id
		}

		$scope.ask_ques = "";

		return QaService.ask_question(question)
			.then(function(data) {
				load_questions($routeParams.id);
			})
			.catch(function(err) {
				console.log(err);
			})
	}

	$scope.answer_question = function(index) {
		// Get the true index of the question in the array before being ordered by timestamp
		var true_index = $scope.questions.length - index - 1;
		// Get the question_id and answer text from the question at the true index
		var question_id = $scope.questions[true_index]._id;
		var ans = $scope.questions[true_index].ans;

		var answer = {
			question_id: question_id,
			body: ans
		}
		// Empty the answer text field
		$scope.questions[true_index].ans = "";

		console.log("Answer object:");
		console.log(answer);
		//somereason on backend mongo this doesnt fill out question field

		return QaService.answer_question(answer)
			.then(function(data) {
				load_answers();
			})
			.catch(function(err) {
			})
	}

	$scope.show_answers = function(index) {
		// Get the true index of the question in the array before being ordered by timestamp
		var true_index = $scope.questions.length - index - 1;
		// Get the question_id from the question at the true index
		var question_id = $scope.questions[true_index]._id;

		return QaService.load_answers(question_id)
			.then(function(data) {
				$scope.questions[true_index].answers = data.data.answers;
			})
			.catch(function(err) {

			})
	}

	$scope.edit_question = function(index) {
		// Get the true index of the question in the array before being ordered by timestamp
		var true_index = $scope.questions.length - index - 1;

		var edit = {
			question_id: $scope.questions[true_index]._id,
			body: $scope.question[true_index].edit
		}

		return QaService.edit_question(edit)
			.then()
			.catch()
	}

	load_material($routeParams.id);
	load_questions($routeParams.id);

}]);
