'use strict';

angular.module('main')

.factory('Map', function(Config, leafletData, $cordovaGeolocation) {
    var popup = '\
    <span class="leaflet-pelias-layer-icon-container">\
        <div class="leaflet-pelias-layer-icon leaflet-pelias-layer-icon-point" title="layer: address">\
        </div>\
    </span>\
    <strong>10 Wendell St</strong>reet, Cambridge, MA, USA"\
    <span><strong>Get directions</strong></span>';

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
        return leafletData.getMap("map")
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
		getCenterObject: getCenterObject,
		getCurrentViewport: getCurrentViewport,
        addRouteToMap: addRouteToMap,
        setMapProperty: setMapProperty
	};
});