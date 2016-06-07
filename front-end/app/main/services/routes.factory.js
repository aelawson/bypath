'use strict';

angular.module('main')

.factory('Routes', function() {
	
	/**
    * Retrieves route from MapQuest given two location strings.
    *
    * @param  {String, String}
    * @return {Directions}
    */
	function getRouteFromStrings(a, b) {
		var dir = MQ.routing.directions();
	    dir.route({
	      locations: [a, b]
	    });

	    return dir;
	};

	/**
    * Retrieves route from MapQuest given two latitude and longitude pairs.
    *
    * @param  {Object, Object}
    * @return {Directions}
    */
	function getRouteFromLatLng(a, b) {
		dir = MQ.routing.directions();
		dir.route({
			locations: [
				{ latLng: { lat: a.lat, lng: a.lng } },
				{ latLng: { lat: b.lat, lng: b.lng } }
			]
		});

		return dir;
	};

	return {
		getRouteFromStrings: getRouteFromStrings,
		getRouteFromLatLng: getRouteFromLatLng
	};
});