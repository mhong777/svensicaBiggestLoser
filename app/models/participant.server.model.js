'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Participant Schema
 */
var ParticipantSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Participant name',
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
    startingWeight:{
        type: Number,
        min: 0,
        max: 500
    },
    targetWeight:{
        type: Number,
        min: 0,
        max: 500        
    },
    milestones:[
        {type: Number, min: 80, max: 500}
    ],
    weightHistory:[
        {type: Number}
    ],
    graphNumbers:[
        {type: Number}
    ],
    points:{
        type: Number,
        min: 0,
        default: 0
    }
});

mongoose.model('Participant', ParticipantSchema);