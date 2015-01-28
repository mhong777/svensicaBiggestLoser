'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Gvar Schema
 */
var GvarSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Gvar name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
    week:{
        type: Number,
        default: 1
    }
});

mongoose.model('Gvar', GvarSchema);