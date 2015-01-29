module.exports = function (io) {
    'use strict';
var mongoose = require('mongoose'),
	User = mongoose.model('User'),   
    Participant = mongoose.model('Participant'),
    Gvar = mongoose.model('Gvar'),
	_ = require('lodash');
    
var totalWeeks=10;
    
        
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
                    var parti={},
                        myStats=[],
                        inputData={},
                        x,
                        userOutput={};
                    for(x=0; x<participants[0].weightHistory.length; x++){
                        inputData={};
                        inputData.weight=participants[0].weightHistory[x];
                        inputData.progress=((1-participants[0].graphNumbers[x])*100).toFixed(2);
                        myStats.push(inputData);
                    }
                    parti.user=participants[0];
                    parti.myStats=myStats;
//                    console.log(parti);
                    
                    io.emit('setUserData', parti);
                }
            }).then(function(){
                //MAKE THE GRAPH INFO
                Participant.find({},{name:1, graphNumbers:1, points:1, _id:0}).exec(function(err, participants){
                   if(err){
                       console.log(err);
                   } 
                    else{
                        var newUserData={},
                            newArray=[],
                            newValue=[],
                            myUser,
                            allData=[],
                            x,
                            y,
                            newUser={},
                            userStats=[],
                            output={},
                            arr=[],
                            sorted,
                            ranks;
                        for(x=0; x<1; x++){//participants.length; x++){
                            //for graph
                            myUser=participants[x];
                            newUserData={};
                            newArray=[];
                            newUserData.key=myUser.name;                            
                            for(y=0; y<myUser.graphNumbers.length; y++){
                                newValue=[];
                                newValue=[y+1,parseFloat(((1-myUser.graphNumbers[y])*100).toFixed(2))];
                                newArray.push(newValue);
                            }
                            newUserData.values=newArray;
                            allData.push(newUserData);
                            
                            //for table
                            newUser={};
                            newUser.name=myUser.name;
                            newUser.points=myUser.points;
                            arr.push(myUser.points);
                            newUser.progress=((1-myUser.graphNumbers[myUser.graphNumbers.length-1])*100).toFixed(2);
                            userStats.push(newUser);
                        }
                        
                        
                        //do the ranks
                        sorted = arr.slice().sort(function(a,b){return b-a});
                        ranks = arr.slice().map(function(v){ return sorted.indexOf(v)+1 });
                        for(x=0; x<userStats.length; x++){
                            userStats[x].rank=ranks[x];
                        }
                        
                        console.log(userStats);
                        
                        //benchmark values
                        newUserData={};
                        newArray=[];
                        newUserData.key='Goal';                        
                        for(var x=0; x<totalWeeks; x++){
                            newValue=[];
                            newValue=[x+1,100];
                            newArray.push(newValue);
                        }
                        newUserData.values=newArray;
//                        allData.push(newUserData);
                        
                        output.graphData=allData;
                        output.userStats=userStats;
                        io.emit('sendUserGraph', output);
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