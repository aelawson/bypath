'use strict';

angular.module('main')

.factory('Map', function(Config, Geolocation, leafletData) {

	var watchId;

    function startWatchingUserPosition() {
        return Geolocation.watchUserPosition({
            frequency : 1000,
            timeout : 3000,
            enableHighAccuracy: true
        });
    };

    /**
    * Initializes Leaflet map position, data, and events.
    * Takes callbacks for positioning success/failure, data,
    * and event initializers.
    *
    * @param  {Function, Function, Function, Function}
    * @return {}
    */
	function initMap(positionSuccess, positionError, mapData, mapEvents) {
	    this.watchId = startWatchingUserPosition();
	    this.watchId
	    .then(null, positionError, positionSuccess)
	    .then(initMapSettings(mapData, mapEvents))
        .then(setMapProperty(initGeocoder))
        .then(setMapProperty(initZoomControls));
	};

    /**
    * Sets initial data and events for the Leaflet map object by
    * executing two callbacks which optionally accept a map object argument.
    *
    * @param  {Function, Function}
    * @return {}
    */
    function initMapSettings(mapData, mapEvents) {
        setMapProperty(function(map) {
            mapData();
            mapEvents(map);
        })
    };

    /**
    * Initializes geocoder on the Leaflet map object.
    *
    * @param  {Object}
    * @return {}
    */
    function initGeocoder(map) {
        var options = {
            bounds: true,
            position: 'topright',
            expanded: true,
            fullWidth: true
        };
        var geocoder = L.control.geocoder(Config.ENV.MAPZEN_KEY, options);
        geocoder.addTo(map);
    };

    /**
    * Initializes geocoder on the Leaflet map object.
    *
    * @param  {Object}
    * @return {}
    */
    function initZoomControls(map) {
        var zoomControls = L.control.zoom({ position: 'topright' });
        zoomControls.addTo(map);
    };

    /**
    * Retrieves the Leaflet map object then executes a callback
    * which accepts a map object argument.
    *
    * @param  {Function}
    * @return {}
    */
    function setMapProperty(callback) {
        leafletData.getMap("map")
        .then(callback);
    };

    /**
    * Adds a given route as a layer to the Leaflet map object.
    *
    * @param  {Function}
    * @return {}
    */
    function addRouteToMap(route) {
        setMapProperty(function(map) {
            map.addLayer(MQ.routing.routeLayer({
                directions: route,
                fitBounds: true
            }));
        });
    };

    /**
    * Removes routes from the Leaflet map object.
    *
    * @param  {}
    * @return {}
    */
    function removeRouteFromMap() {
        setMapProperty(function(map) {
            map.addLayer(MQ.routing.routeLayer({
                directions: route,
                fitBounds: true
            }));
        });
    };

	function Viewport() {
        Viewport.prototype.latitude;
        Viewport.prototype.longitude;
        Viewport.prototype.distance;
    };

    function getCurrentViewport(map) {
        var v = new Viewport();
        var coords = map.getCenter();
        var ne = map.getBounds().getNorthEast();
        var sw = map.getBounds().getSouthWest();
        var dist = Math.max(Math.abs(ne.lat - sw.lat), Math.abs(ne.lng - sw.lng));
        v.latitude = coords.lat;
        v.longitude = coords.lng;
        v.distance = dist;

        return v;
    };

    function getCenterObject(latitude, longitude, zoom) {
        return  {
            lat: latitude,
            lng: longitude,
            zoom: zoom
        };
    };

	return {
		watchId : watchId,
		initMap : initMap,
		getCenterObject: getCenterObject,
		getCurrentViewport: getCurrentViewport
	};
});