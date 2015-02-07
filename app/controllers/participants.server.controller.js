'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Participant = mongoose.model('Participant'),
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
				message = 'Participant already exists';
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
* GET A PARTICIPANT BY THEIR NAME
*/
exports.getByName = function(req, res) {
    var mname={};
    mname.name=req.body.name;
    Participant.find(mname).exec(function(err, participants) {
        if (err) {
            console.log(err);
        } else {
            res.jsonp(participants[0]);
        }
    });    
};

/**
* SET THE INITIAL WEIGHT
**/
exports.setInitialWeight = function(req, res) {
    var mname={};
    mname.name=req.body.name;
    Participant.find(mname).exec(function(err, participants) {
        if (err) {
            console.log(err);
        } else {            
            var parti=participants[0];
            parti.startingWeight=req.body.startingWeight;
            parti.targetWeight=req.body.targetWeight;

            parti.weightHistory=[];
            parti.graphNumbers=[];
            parti.milestones=[];

            parti.weightHistory.push(parti.startingWeight);
            parti.graphNumbers.push(0);

            var difference = (parti.startingWeight-parti.targetWeight)/4;
            difference = difference.toFixed(2);

            for(var x=1;x<5;x++){
                parti.milestones.push(parti.startingWeight-difference*x);
            }                                        

            parti.save(function(err) {
                if (err) {
                    console.log(err);
                }
                else{
                    res.jsonp(parti);
                }
            });            
        }
    });    
};

/**
* GET STATS FOR TABLE
**/
exports.getMyStats = function(req, res) {
    var mname={};
    mname.name=req.body.name;
    
    Participant.find(mname).exec(function(err, participants) {
        if (err) {
            console.log(err);
        } else {
            var myStats=[],
                inputData={},
                x;

            for(x=0; x<participants[0].weightHistory.length; x++){
                inputData={};
                inputData.weight=participants[0].weightHistory[x];
                inputData.progress=(participants[0].graphNumbers[x]).toFixed(2);
                myStats.push(inputData);
            }
            res.jsonp(myStats);
        }
    });      
};

/**
* ADD WEIGHT TO PARTICIPANT
**/
exports.addWeight = function(req, res) {
    var mname={},
        currentWeek;
    mname.name=req.body.name;   
    
    Gvar.find().exec(function(err, gvars) {
        if (err) {
            console.log(err);
        } else {
            currentWeek=gvars[0].week;


            //calculate points and add to user
            Participant.findById(req.body.userId).exec(function(err, parti) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('week ' + currentWeek);
                    console.log(parti);
                    //######TODO
                    //need to add points - make sure you don't double tap
                    //need a way to track
                    //or only let ppl put in their weight once
                    if(currentWeek===4){
                        if(req.body.weightInput<=parti.milestones[0]){
                            parti.pointArray.splice(0,1,5);
                        }
                        else{
                            parti.pointArray.splice(0,1,0);
                        }                                
                    }
                    else if(currentWeek>4 && currentWeek<8){
                        //5 6 7
                        if(req.body.weightInput<=parti.milestones[0]){
                            parti.pointArray.splice(currentWeek-4,1,0);
                        }
                        else{
                            parti.pointArray.splice(currentWeek-4,1,-1);
                        }                                
                    }
                    else if(currentWeek===8){
                        if(req.body.weightInput<=parti.milestones[1]){
                            parti.pointArray.splice(4,1,5);
                        }
                        else{
                            parti.pointArray.splice(4,1,0);
                        }                                
                    }
                    else if(currentWeek>8 && currentWeek<12){
                        if(req.body.weightInput<=parti.milestones[1]){
                            parti.pointArray.splice(currentWeek-8+4,1,0);
                        }
                        else{
                            parti.pointArray.splice(currentWeek-8+4,1,-1);
                        }                                
                    }
                    else if(currentWeek===12){
                        if(req.body.weightInput<=parti.milestones[2]){
                            parti.pointArray.splice(8,1,5);
                        }
                        else{
                            parti.pointArray.splice(8,1,0);
                        }                                                                
                    }
                    else if(currentWeek>12 && currentWeek<16){
                        if(req.body.weightInput<=parti.milestones[2]){
                            parti.pointArray.splice(currentWeek-12+8,1,0);
                        }
                        else{
                            parti.pointArray.splice(currentWeek-12+8,1,-1);
                        }                                
                    }
                    else if(currentWeek===16){
                        if(req.body.weightInput<=parti.milestones[3]){
                            parti.pointArray.splice(16,1,10);
                        }
                        else{
                            parti.pointArray.splice(16,1,0);
                        }                                
                    }
                    parti.weightHistory.splice(req.body.week-1, 1,req.body.weightInput);
//                    newValue=[y+1,parseFloat(((1-myUser.graphNumbers[y])*100).toFixed(2))];
                    
                    var currDiff = parti.startingWeight - req.body.weightInput,
                        goalDiff = parti.startingWeight - parti.targetWeight,
                        graphNum = parseFloat(currDiff/goalDiff*100).toFixed(2);
                    
                    parti.graphNumbers.splice(req.body.week-1,1,graphNum);

                    var ptot=0;
                    for(var z=0; z<parti.pointArray.length; z++){
                        ptot+=parti.pointArray[z];
                    }
                    parti.points=ptot;

                    parti.save(function(err) {
                        if (err) {
                            console.log(err);
                        }
                        else{
                            res.jsonp(parti);
                        }
                    });
                }
            });                       
        }
    });     
};

/**
 * Create a Participant
 */
exports.create = function(req, res) {
	var participant = new Participant(req.body);
	participant.user = req.user;

	participant.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(participant);
		}
	});
};

/**
 * Show the current Participant
 */
exports.read = function(req, res) {
	res.jsonp(req.participant);
};

/**
 * Update a Participant
 */
exports.update = function(req, res) {
	var participant = req.participant ;

	participant = _.extend(participant , req.body);

	participant.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(participant);
		}
	});
};

/**
 * Delete an Participant
 */
exports.delete = function(req, res) {
	var participant = req.participant ;

	participant.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(participant);
		}
	});
};

/**
 * List of Participants
 */
exports.list = function(req, res) { Participant.find().sort('-created').populate('user', 'displayName').exec(function(err, participants) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(participants);
		}
	});
};

/**
 * Participant middleware
 */
exports.participantByID = function(req, res, next, id) { Participant.findById(id).populate('user', 'displayName').exec(function(err, participant) {
		if (err) return next(err);
		if (! participant) return next(new Error('Failed to load Participant ' + id));
		req.participant = participant ;
		next();
	});
};

/**
 * Participant authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.participant.user.id !== req.user.id) {
		return res.send(403, 'User is not authorized');
	}
	next();
};