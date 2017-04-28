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

				console.log($scope.questions);

			})
			.catch(function(err) {
				console.log(err);
			})
	}

	$scope.ask_question = function() {
		var ques = document.getElementById("ask_ques").value;

		var question = {
			body: ques,
			material_id: $scope.material_id
		}

		return QaService.ask_question(question)
			.then(function(data) {
				load_questions($routeParams.id);
			})
			.catch(function(err) {
				console.log(err);
			})
	}

	$scope.answer_question = function(question_id) {
		// var ans = document.getElementById("answer_ques").value;
		var ans = document.getElementById(question_id).value;
		var answer = {
			question_id: question_id,
			body: ans
		}

		console.log("Answer object:");
		console.log(answer);
		//somereason on backend mongo this doesnt fill out question field

		return QaService.answer_question(answer)
			.then(function(data) {
				load_answers()
			})
			.catch(function(err) {

			})
	}

	load_material($routeParams.id);
	load_questions($routeParams.id);

}]);
