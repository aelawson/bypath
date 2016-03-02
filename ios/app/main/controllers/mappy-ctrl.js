'use strict';
angular.module('main')
.controller('MappyCtrl', function ($log, Geolocation, ThreeOneOne) {

  // Note that 'mappyCtrl' is also established in the routing in main.js.
  var mappyCtrl = this;

  // Defaults.
  mappyCtrl.zoom = 10;
  mappyCtrl.boston = { // This object is formatted to imitate the coords object from the geolocator.
    coords: {
      latitude: 42.4,
      longitude: -71.1
    }
  };
  mappyCtrl.complaintTypes = [
    'Ground Maintenance'
    , 'Request for Snow Plowing'
    , 'Park Maintenance'
    , 'Unsafe/Dangerous Conditions'
    // , 'Metrolist Survey'
  ];

  // Tests.
  // $log.log('Hello from your Controller: MappyCtrl in module main:. This is your controller:', this);
  // var test = ThreeOneOne.get311(mappyCtrl.complaintTypes);
  // $log.log(test);

  var initializeMap = function (position, markers) {
    //\\
    // $log.log('initializeMap position -> ', position);

    // Create the Google Map
    mappyCtrl.map = {
      center: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      zoom: mappyCtrl.zoom,
      // bounds: '',
      // bounds="mappyCtrl.map.bounds"
      // control: {},
      // styles: mappyStyle,
      options: {scrollwheel: false},
      disableDefaultUI: false
    };
  };

  var getLocation = function () {
    Geolocation.get()
      .then(function (position) { // Success.
        // return position
        initializeMap(position);
      },
      function (err) { // Error. Possibly/probably because it wasn't allowed.
        $log.log("Shit! (Maybe geolocation wasn't allowed?).\nError: ", err);
        // return err;
        // return mappyCtrl.boston;
        initializeMap(mappyCtrl.boston);
      });
  };

  function matchIcon (obj) {
    var desc = obj.description;
    var icon_path = '';

    var groundy = /ground/i;
    var snowy = /snow/i;
    var parky = /park/i;
    var dangery = /danger/i;

    if (desc.match(groundy)) {
      icon_path = 'main/assets/images/danger-hump.png';
    }
    else if (desc.match(snowy)) {
      icon_path = 'main/assets/images/snow_plow_truck.png';
    }
    else if (desc.match(parky)) {
      icon_path = 'main/assets/images/lawnmower.png';
    }
    else if (desc.match(dangery)) {
      icon_path = 'main/assets/images/falling-person.png';
    }
    else {
      icon_path = 'main/assets/images/snowflake-icon.png';
    }
    return icon_path;
  };

  function setIcons (objArray) {
    var dataWithIcons = [];

    for (var i = 0; i < objArray.length; i++) {
      var a = objArray[i];
      a.icon = matchIcon(a);
      dataWithIcons.push(a);
    }

    return dataWithIcons;
  };


  var markerArray311 = function () {
    ThreeOneOne.get311(mappyCtrl.complaintTypes)
      .then(function got311 (data) {
        $log.log(data);

        var markers = setIcons(data);

        mappyCtrl.threeOneOneMarkers = markers;
        getLocation(); // This will check for availability of current location and then initialize the map with either the current loc or with default Boston.
      }, function failedGetting311 (err) {
        $log.log("Errrrrororrrr...", err);
      });
  };


  markerArray311();

});
