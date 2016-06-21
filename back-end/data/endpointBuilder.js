var modules = require('./../util/modules.js');
var sql = require('./SQLData.js');

var UPDATE_ROOT = 'updates/';

// Name - string: object identifer
// url - string: of the url to query
// key - string: access key for the query
// query - string: the sql query
// map - json: a mapping from the query to the our object schema
function Endpoint(name, url, key, query, map){
    this.name = name;
    this.url = url;
    this.key = key;
    this.query = query;
    this.map = map;
    
    this.scheduler;
    
    // This just prints out all members of this class
    Endpoint.prototype.print = function(){
        console.log("----- Endpoint Begin -----");
        console.log("Name: " + this.name);
        console.log("Url: " + this.url);
        console.log("Key: " + this.key);
        console.log("Query: " + this.query);
        console.log(this.map);
        console.log("----- Endpoint End -----");
    }
    
    Endpoint.prototype.init = function(){
        this.scheduler = new sql();
    }
    
    // timerSchedule: string in a cron job schedule format eg: "* * * * * *"
    Endpoint.prototype.start = function (timerSchedule){
        console.log(timerSchedule);
        this.scheduler.init(this.url, this.key, this.query, UPDATE_ROOT + this.name);
        this.scheduler.run(timerSchedule, this.addItems.bind(this));
    }
    
    Endpoint.prototype.forceUpdate = function () {
        this.scheduler.init(this.url, this.key, this.query, UPDATE_ROOT + this.name);
        this.scheduler.forceUpdate(this.addItems.bind(this));
    }
    
    // obj: json object
    // prop: string to search the json object
    // This returns a value from a nested json object
    // seperated by '.'
    // eg point.x would return obj['point']['x']
    function findProp(obj, prop){
        var defval = null;
        var props = prop.split('.');
        
        for (var i = 0; i < props.length; i++) {
            if(typeof obj[props[i]] == 'undefined'){
                console.log('could not find property ' + prop);
                return defval;
            }
            obj = obj[props[i]];
        }
        return obj;
    }
    
    // Body: Array of json objects
    Endpoint.prototype.addItems = function(body){
        var db = modules.getModule('db');
        
        try {
            var r = JSON.parse(body);
            
            console.log('adding items from ' + this.name);
            
            for (i in r) {
                try {
                    // I pull the values out of the json object first
                    // so if I am missing any it will throw an error
                    // and not add the object
                    var id = this.map['id'];
                    var title = this.map['title'];
                    var type = this.map['type'];
                    var location = this.map['location'];
                    var open = this.map['open'];
                    var lat = this.map['latitude'];
                    var lon = this.map['longitude'];
                    
//                     item = {
//                         'id': findProp(r[i], id),
//                         'title': findProp(r[i], title),
//                         'type': findProp(r[i], type),
//                         'location': findProp(r[i], location),
//                         'open': findProp(r[i], open),
//                         'geo': findProp(r[i], lat) + ',' + findProp(r[i], lon),
//                         'source': this.name,
//                     };
                    
                    issue = {
                        source_id:findProp(r[i], id),
                        title: findProp(r[i], title),
                        type: findProp(r[i], type),
                        opened: findProp(r[i], open),
                        source: this.name,
                        address: findProp(r[i], location),
                        latitude: findProp(r[i], lat),
                        longitude: findProp(r[i], lon)
                    };
                    
                    db.addIssue(issue);
                }
            catch (e) {
                    console.log('error in creating new item');
                    console.log(e);
                }
            }
        }
        catch (e) {
            console.log('error parsing resuslt data to json');
            console.log(e);
        }    
    }
    
    // This needs to be worked so if we don't have a vaild
    // endpoint we can delete it
    Endpoint.prototype.isVaild = function () {
        if ((this.name === undefined ||this.name === "")||
            (this.url === undefined ||this.url === "")||
            (this.key === undefined ||this.key === "")||
            (this.query === undefined ||this.query === "")||
            (this.map === undefined ||this.map === "")) {
            return false;
        }

        return true;
    }
}

module.exports = {
    // j - json: list of json objects
    createEndpoints: function(endpointsJson){
        var output = [];
        
        for (i in endpointsJson) {
            var endpoint = this.createEndpoint(i, endpointsJson[i]);
            output.push(endpoint);
        }
        
        return output;
    },

    createEndpoint: function (name, data) {
        // In the future we might want to cache this
        var resourceMgr = modules.getModule('resource_manager');
        
        var output;
        
        var url = data['url'];
        var keyName = data['key']; // Key needs to be loaded from the keys.txt file
        var key = resourceMgr.getKey(keyName);
        var query = data['query'];
        var map = data['map'];
        
        //console.log(url);
        //console.log(key);
        //console.log(query);
        //console.log(map);
        
        output = new Endpoint(name, url, key, query, map);
        
        console.log(output);
        
        return output;
    },
}