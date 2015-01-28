'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Gvar = mongoose.model('Gvar'),
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
				message = 'Gvar already exists';
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
 * Create a Gvar
 */
exports.create = function(req, res) {
	var gvar = new Gvar(req.body);
	gvar.user = req.user;

	gvar.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(gvar);
		}
	});
};

/**
 * Show the current Gvar
 */
exports.read = function(req, res) {
	res.jsonp(req.gvar);
};

/**
 * Update a Gvar
 */
exports.update = function(req, res) {
	var gvar = req.gvar ;

	gvar = _.extend(gvar , req.body);

	gvar.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(gvar);
		}
	});
};

/**
 * Delete an Gvar
 */
exports.delete = function(req, res) {
	var gvar = req.gvar ;

	gvar.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(gvar);
		}
	});
};

/**
 * List of Gvars
 */
exports.list = function(req, res) { Gvar.find().sort('-created').populate('user', 'displayName').exec(function(err, gvars) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(gvars);
		}
	});
};

/**
 * Gvar middleware
 */
exports.gvarByID = function(req, res, next, id) { Gvar.findById(id).populate('user', 'displayName').exec(function(err, gvar) {
		if (err) return next(err);
		if (! gvar) return next(new Error('Failed to load Gvar ' + id));
		req.gvar = gvar ;
		next();
	});
};

/**
 * Gvar authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.gvar.user.id !== req.user.id) {
		return res.send(403, 'User is not authorized');
	}
	next();
};