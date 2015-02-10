'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Workout = mongoose.model('Workout'),
	_ = require('lodash');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = 'Workout already exists';
				break;
			default:
				message = 'Something went wrong';
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};

/**
 * Create a Workout
 */
exports.create = function(req, res) {
	var workout = new Workout(req.body);
	workout.user = req.user;

	workout.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(workout);
		}
	});
};

/**
 * Show the current Workout
 */
exports.read = function(req, res) {
	res.jsonp(req.workout);
};

/**
 * Update a Workout
 */
exports.update = function(req, res) {
	var workout = req.workout ;

	workout = _.extend(workout , req.body);

	workout.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(workout);
		}
	});
};

/**
 * Delete an Workout
 */
exports.delete = function(req, res) {
	var workout = req.workout ;

	workout.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(workout);
		}
	});
};

/**
 * List of Workouts
 */
exports.list = function(req, res) { Workout.find().sort('-created').populate('user', 'displayName').exec(function(err, workouts) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(workouts);
		}
	});
};

/**
 * Workout middleware
 */
exports.workoutByID = function(req, res, next, id) { Workout.findById(id).populate('user', 'displayName').exec(function(err, workout) {
		if (err) return next(err);
		if (! workout) return next(new Error('Failed to load Workout ' + id));
		req.workout = workout ;
		next();
	});
};

/**
 * Workout authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.workout.user.id !== req.user.id) {
		return res.send(403, 'User is not authorized');
	}
	next();
};