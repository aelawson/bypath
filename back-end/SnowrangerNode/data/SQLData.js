﻿/* boston311.js
 * This will go out and grab relivent data from the boston's 311 data and send it to the firebase
*/ 

// Includes
var modules = require('./../util/modules.js');
var cronJob = require('cron').CronJob;
var request = require('request');



module.exports = SqlScheduleQuery;

function SqlScheduleQuery(){
    SqlScheduleQuery.prototype.init = function(url, key, query, updatePath){
        this.url = url;
        this.key = key;
        this.query = query;
        this.updatePath = updatePath;
    }
    
    SqlScheduleQuery.prototype.run = function(cronSchedule, callback){
        this.cJob = new cronJob(cronSchedule, function(){
            console.log('cron job start');
            retieveData(this.updatePath, this.url, this.query, this.key, callback);
            console.log('cron job end');
        }.bind(this), null, true, 'UTC');
    }
    
    SqlScheduleQuery.prototype.forceUpdate = function (callback) {
        retieveData(this.updatePath, this.url, this.query, this.key, callback);
    }
    
    SqlScheduleQuery.prototype.test = function(){
        console.log(this.url + " " + this.query + " " + this.key);
    }
    
    function retieveData(updatePath, url, query, key, callback) {
        var db = modules.getModule('db');
        console.log("Update path: " + updatePath);
        
//         db.getLastUpdated(updateSource, function(data){
//             if(data[0] === undefined)
//                 console.log('this source does not exist');
//                 db.addNewSourceUpdate(updateSource);
//             }
//             else
//             {
//                 console.log('data recieved for the db');
//                 console.log(data);
//                 
//                 var date = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();
//                 date = date.replace('Z', '');
//                 
//                 db.setSourceUpdated(updateSource, date);
//             }
//         });
        
        
        db.getLastUpdated(updatePath, function (data) {
            var date = data;
            if (data === null) {
                console.log('Date for ' + updatePath + " does not exist yet");
                // Create a formated date that we can use if one does not exist
                var date = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();
                date = date.replace('Z', '');
                
                db.addNewSourceUpdate(updatePath);
            }
            
            sqlQuery(date, url, query, key, function (res) {
                // Add the result of the query to the db
                callback(res);
                
                // Might want to do some checks to make sure there were no errors when
                // sending the data to the db before setting the last upated time
                console.log('Query completed');
                db.setSourceUpdated(updatePath, new Date().toISOString().replace('Z', ''));
                console.log('Update ' + updatePath + ' date set');
            });
        });
    }
    
    // TODO: maybe the getMeASoda module injection belongs somewhere closer to here?
    function sqlQuery(date, url, query, key, callback){    
        // Need to add based on case types
        query = query.replace('$date', date);
        console.log(query);
        var stmnt = url + query;

        var options = {
            method: 'GET',
            url: stmnt,
            headers: {
                'X-App-Token': key
            }
        };

        var req = request(options, function (error, response, body) {
            if (error) {
                console.log(error);
            }
            else {
                callback(body);
            }
        });
    }      
}