'use strict';

angular.module('main')

.factory('Routes', function() {
	
	/**
    * Retrieves route from MapQuest given two location strings.
    *
    * @param  {String, String}
    * @return {Directions}
    */
	function getRoute(a, b) {
		console.log("Route");
		var dir = MQ.routing.directions();
	    dir.route({
	      locations: [a, b]
	    });

	    return dir;
	};

	return {
		getRoute: getRoute
	};
});