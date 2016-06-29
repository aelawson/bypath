'use strict';

angular.module('main')

.controller('MapCtrl', function($scope, $state, $log, $filter, $cordovaGeolocation, Config, Database, Map, Routes, TileSets) {

    var mapCtrl = this;
    var watchId;
    mapCtrl.incidents = {};
    mapCtrl.incidentsGeotagged = [];
    mapCtrl.filters = {};
    mapCtrl.popup =
        '<div class="item item-text-wrap item-icon-right">\
        <h3>{{ incidentSelected.title }}</h3>\
        <p>{{ incidentSelected.address }}</p>\
        <span class="type type-balanced type-small">Opened: </span>\
        <span class="type type-muted type-small">{{ incidentSelected.opened | date:"MMM dd" }}</span>\
        </div>';

    // Default scope values.
    $scope.incidentSelected = {};
    $scope.markers = [];
    $scope.tiles = {
        name: "Streets Basic",
        url: Config.ENV.MAPBOX_API,
        type: "xyz",
        options: {
            mapid: "mapbox.streets-basic",
            format: "png",
            apikey: "pk.eyJ1IjoiYWVsYXdzb24iLCJhIjoiY2luMnBtdGMxMGJta3Y5a2tqd29sZWlzayJ9.wxiPp_RFGYXGB2SzXZvfaA"
        }
    };
    $scope.defaults = {
        zoomControl: false
    };
    $scope.mapReady = false;
    $scope.userLocation = {};
    $scope.destination = {};

    // Initialize map data.
    function initMapData() {
        Database.getIssues($scope.center.lat, $scope.center.lng, 0.35, function(incidents) {
            mapCtrl.incidents = incidents;
            generateMapMarkers();
        });
    };

    // Set events on the map.
    function initMapEvents(map) {
        $scope.$on('leafletDirectiveMap.map.moveend', function() {
            var viewport = Map.getCurrentViewport(map);
            Database.getIssues(viewport.latitude, viewport.longitude, viewport.distance, function(incidents) {
                mapCtrl.incidents = incidents;
                generateMapMarkers();
            });
        });
        $scope.$on('leafletDirectiveMarker.map.click', function(e, args) {
            $scope.incidentSelected = args.model.model;
        });
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
        geocoder.on('select', function(e) {
          $scope.destination = e.latlng;
        });
        geocoder.addTo(map);
        var zoomControl = L.control.zoom({
             position:'topright'
        });
        zoomControl.addTo(map);
        var userLocation = L.easyButton({
            id: 'id-for-the-button',  // an id for the generated button
            position: 'bottomright',      // inherited from L.Control -- the corner it goes in
            type: 'replace',          // set to animate when you're comfy with css
            leafletClasses: true,     // use leaflet classes to style the button?
            states:[{                 // specify different icons and responses for your button
                stateName: 'get-center',
                onClick: function(button, map) {
                    $log.debug("Relocate to user.");
                    var userLocation = {};
                    userLocation.lat = $scope.userLocation.lat;
                    userLocation.lng = $scope.userLocation.lng;
                    userLocation.zoom = $scope.userLocation.zoom;
                    $scope.center = userLocation;
                },
                title: 'show me the middle',
                icon: 'fa-crosshairs fa-lg'
            }]
        });
        userLocation.addTo(map);
    };

    function generateMapMarkers() {
        var markers = [];
        angular.forEach(mapCtrl.incidents, function(value, key) {
            mapCtrl.filters[value.type] = value.type;
            var extendedObj = angular.extend(value, {
                'markablePosition': {
                    latitude: value.latitude,
                    longitude: value.longitude
                }
            });
            if (value.latitude && value.longitude) {
                markers[value.id] = {
                    group:              'all',
                    model:              value,
                    lat:                value.latitude,
                    lng:                value.longitude,
                    message:            mapCtrl.popup,
                    getMessageScope:    function() { return $scope; },
                    focus:              false,
                    draggable:          false
                };
            }
        });

        $scope.markers = markers;
    };

    function initDefaultRoute() {
        var src = { latLng: { lat: $scope.userLocation.lat, lng: $scope.userLocation.lng } };
        var dest = { latLng: { lat: 42.3501645, lng: -71.0589211 } };
        var route = Routes.getRoute(src, dest);
        Map.addRouteToMap(route);
    };

    // TODO: This is redundant - am running into issues with the scope of $scope (yodawg) when I try to use callbacks.
    // Need to figure that out and abstract this out into a singular function.
    var getInitialLocation = function() {
        $cordovaGeolocation.getCurrentPosition({
            timeout : 5000,
            maximumAge: 3000,
            enableHighAccuracy: true
        })
        .then(function positionSuccess(position) {
            $log.debug("Updated user position.");
            $scope.userLocation = Map.getCenterObject(
                position.coords.latitude,
                position.coords.longitude,
                12
            );
            $scope.center = $scope.userLocation;
            $scope.mapReady = true;
        }, function positionError(error) {
            $log.debug("Failed to update user position.");
            $log.debug(error);
            $scope.center = {
                lat: 42.39137720000001,
                lng: -71.1473425,
                zoom: 12
            };
            $scope.userLocation = $scope.center;
            $scope.mapReady = true;
        });
    };

    var getCurrentLocation = function() {
        $cordovaGeolocation.getCurrentPosition({
            timeout : 5000,
            maximumAge: 3000,
            enableHighAccuracy: true
        })
        .then(function positionSuccess(position) {
            $log.debug("Updated user position.");
            $scope.userLocation = Map.getCenterObject(
                position.coords.latitude,
                position.coords.longitude,
                $scope.userLocation.zoom
            );
        }, function positionError(error) {
            $log.debug("Failed to update user position.");
            $log.debug(error);
            $scope.userLocation = {
                lat: 42.39137720000001,
                lng: -71.1473425,
                zoom: 12
            };
        });
    };

    var pollCurrentLocation = function(timeout) {
        getCurrentLocation();
        setTimeout(pollCurrentLocation, timeout);
    };

    // Get initial location and load map.
    if (navigator.geolocation) {
        $log.debug("Get initial location.");
        getInitialLocation();
    }
    else {
        $scope.center = {
            lat: 42.39137720000001,
            lng: -71.1473425,
            zoom: 12
        };
        $scope.mapReady = true;
    }

    Map.setMapProperty(initMapEvents);
    Map.setMapProperty(initMapData);
    Map.setMapProperty(initGeocoder);
    initDefaultRoute();
});
