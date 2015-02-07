'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var participants = require('../../app/controllers/participants');

	// Participants Routes
	app.route('/participants')
		.get(participants.list)
		.post(users.requiresLogin, participants.create);
    
    app.route('/getByName')
        .post(participants.getByName);
    
    app.route('/getMyStats')
        .post(participants.getMyStats);    

    app.route('/addWeight')
        .post(participants.addWeight);    
    
    app.route('/setInitialWeight')
        .post(participants.setInitialWeight);
    
	app.route('/participants/:participantId')
		.get(participants.read)
		.put(users.requiresLogin, participants.hasAuthorization, participants.update)
		.delete(users.requiresLogin, participants.hasAuthorization, participants.delete);

	// Finish by binding the Participant middleware
	app.param('participantId', participants.participantByID);
};