'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var workouts = require('../../app/controllers/workouts');

	// Workouts Routes
	app.route('/workouts')
		.get(workouts.list)
		.post(users.requiresLogin, workouts.create);

	app.route('/workouts/:workoutId')
		.get(workouts.read)
		.put(users.requiresLogin, workouts.hasAuthorization, workouts.update)
		.delete(users.requiresLogin, workouts.hasAuthorization, workouts.delete);

	// Finish by binding the Workout middleware
	app.param('workoutId', workouts.workoutByID);
};