module.exports = function (io) {
    'use strict';
var mongoose = require('mongoose'),
	User = mongoose.model('User'),   
    Participant = mongoose.model('Participant'),
    Gvar = mongoose.model('Gvar'),
	_ = require('lodash');
    

    
        
    io.on('connection', function(socket){
        
        socket.broadcast.emit('user connected');
        
        socket.on('test msg', function(input){
            console.log(input);
            io.emit('test back', input);
        });    
        
        /*****
        SELECT A PLAYER AND SET THE INITIAL WEIGHT
        *****/
        socket.on('setInitialWeight', function(input){
            //get selected owner
            console.log(input);
            Participant.find({name:input.userId}).exec(function(err, participants) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('before\n' + participants[0]);
                        var parti=participants[0];
                    
                    parti.startingWeight=input.currWeight;
                    parti.targetWeight=input.tarWeight;
                    
                    parti.weightHistory=[];
                    parti.graphNumbers=[];
                    parti.milestones=[];
                    
                    parti.weightHistory.push(parti.startingWeight);
                    parti.graphNumbers.push(1);
                    
                    var difference = (parti.startingWeight-parti.targetWeight)/4;
                    difference = difference.toFixed(2);
                    
                    for(var x=1;x<5;x++){
                        parti.milestones.push(parti.startingWeight-difference*x);
                    }                                        
                    
                    parti.save();
                    console.log('after\n' + parti);                    
//                    io.emit('playerChosen', output);                                                          
                }
            });                          
        });
        
        /****
        GET DATA AND CREATE DATA STRUCTURE FOR GRAPH
        ****/        
        socket.on('getUserData', function(input){
            //SEND OUT THE USER INFO
            Participant.find({name:input}).exec(function(err, participants) {
                if (err) {
                    console.log(err);
                } else {
                    io.emit('setUserData', participants[0]);
                }
            }).then(function(){
                //MAKE THE GRAPH INFO
                Participant.find({},{name:1, graphNumbers:1, _id:0}).exec(function(err, participants){
                   if(err){
                       console.log(err);
                   } 
                    else{
                        var newUserData={},
                            newArray=[],
                            newValue={},
                            myUser,
                            allData=[];
                        for(var x=0; x<participants.length; x++){
                            myUser=participants[x];
                            newUserData={};
                            newArray=[];
                            for(var y=0; y<myUser.graphNumbers.length; y++){
                                newValue.x=y+1;
                                newValue.y=myUser.graphNumbers[y];
                                newArray.push(newValue);
                            }
                            newUserData.values=newArray;
                            newUserData.key=myUser.name;
                            allData.push(newUserData);
                        }
                        io.emit('sendUserGraph', allData);
                    }
                });            
            });
        });        
        
        /****
        ADD WEIGHT TO A USER
            NEED TO ADD TO WEIGHT HISTORY AND GRAPH NUMBERS
            SEND BACK UPDATED USER DATA
            HAVE THE CLIENT UPDATE THE GRAPH DATA AND DIGEST
        ****/
        socket.on('addWeight', function(input){
            Participant.findById(input.userId).exec(function(err, parti) {
                if (err) {
                    console.log(err);
                } else {                    
                    parti.weightHistory.splice(input.week-1, 1,input.weightInput);
                    parti.graphNumbers.splice(input.week-1,1,parseFloat(input.weightInput/parti.startingWeight));
                    
                    parti.save(function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            Participant.findById(input.userId).exec(function(err, part) {
                                if (err) {
                                    console.log(err);
                                } else {
                                }
                                    io.emit('weightAdded', part);
                            })                
                        }
                    });                    
                }
            });   
        });
        
        
    });          
    
};