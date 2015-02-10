'use strict';

//Setting up route
angular.module('workouts').config(['$stateProvider',
	function($stateProvider) {
		// Workouts state routing
		$stateProvider.
		state('listWorkouts', {
			url: '/workouts',
			templateUrl: 'modules/workouts/views/list-workouts.client.view.html'
		}).
		state('createWorkout', {
			url: '/workouts/create',
			templateUrl: 'modules/workouts/views/create-workout.client.view.html'
		}).
		state('viewWorkout', {
			url: '/workouts/:workoutId',
			templateUrl: 'modules/workouts/views/view-workout.client.view.html'
		}).
		state('editWorkout', {
			url: '/workouts/:workoutId/edit',
			templateUrl: 'modules/workouts/views/edit-workout.client.view.html'
		});
	}
]);