// Creates the gservice factory. This will be the primary means by which we interact with Google Maps
angular.module('gservice', [])
    .factory('gservice', function($http, $rootScope){

// Initialize Variables
// -------------------------------------------------------------
// Service our factory will return
var googleMapService = {};

// Handling Clicks and location selection
googleMapService.clickLat  = 0;
googleMapService.clickLong = 0;

// Array of locations obtained from API calls
var locations = [];

// Selected Location (initialize to center of Bdx)
var selectedLat = 44.843;
var selectedLong = -0.595;

// Functions
// --------------------------------------------------------------
// Refresh the Map with new data. Function will take new latitude and longitude coordinates.
googleMapService.refresh = function(latitude, longitude){

    // Clears the holding array of locations
    locations = [];

    // Set the selected lat and long equal to the ones provided on the refresh() call
    selectedLat = latitude;
    selectedLong = longitude;

    // Perform an AJAX call to get all of the records in the db.
    $http.get('/users').then(function(response){

        // Convert the results into Google Map Format
        locations = convertToMapPoints(response.data);
        // Then initialize the map.
        initialize(latitude, longitude);
    }, function(){});
};

// Private Inner Functions
// --------------------------------------------------------------
// Convert a JSON of users into map points
var convertToMapPoints = function(response){

    // Clear the locations holder
    var locations = [];

    // Loop through all of the JSON entries provided in the response
    for(var i= 0; i < response.length; i++) {
        var user = response[i];

        // Create popup windows for each record
        var  contentString =
            '<p><b>Lieu</b>: ' + user.adresse +
            '<br><b>Type</b>: ' + user.volume +
            '<br><b>Créé le</b>: ' + user.created_at +
            '</p>';

        // Converts each of the JSON records into Google Maps Location format (Note [Lat, Lng] format).
        locations.push({
            latlon: new google.maps.LatLng(user.location[1], user.location[0]),
            message: new google.maps.InfoWindow({
                content: contentString,
                maxWidth: 320
            })
        });
    }
// location is now an array populated with records in Google Maps format
return locations;
};

// Initializes the map
var initialize = function(latitude, longitude) {
        var geocoder = new google.maps.Geocoder();
        var infowindow = new google.maps.InfoWindow();
        var address;

        if (geocoder) {
            var latlng = latitude+","+longitude;
            var latlngStr = latlng.split(',', 2);
            latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
            geocoder.geocode({'location': latlng}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        infowindow.setContent(results[0].formatted_address);
                        address = results[0].formatted_address.split(',')[0];
                        googleMapService.address = address;
                        $rootScope.$broadcast("clicked");
                    } else {
                        window.alert('No results found');
                    }
                } else {
                window.alert('Geocoder failed due to: ' + status);
                }
            });
        }
        infowindow.open(map,marker);
    // Uses the selected lat, long as starting point
    var myLatLng = {lat: parseFloat(selectedLat), lng: parseFloat(selectedLong)};

    // If map has not been created already...
     if (!map){

        // Create a new map and place in the index.html page
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 18,
            center: myLatLng
        });
     }

    // Loop through each location in the array and place a marker
    locations.forEach(function(n, i){
        var marker = new google.maps.Marker({
            position: n.latlon,
            map: map,
            title: "Big Map",
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        });

        // For each marker created, add a listener that checks for clicks
        google.maps.event.addListener(marker, 'click', function(e){

            // When clicked, open the selected marker's message
            currentSelectedMarker = n;
            n.message.open(map, marker);
        });
    });

    // Set initial location as a bouncing red marker
    var initialLocation = new google.maps.LatLng(latitude, longitude);
    var marker = new google.maps.Marker({
        position: initialLocation,
        animation: google.maps.Animation.BOUNCE,
        map: map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });
    lastMarker = marker;

    // Function for moving to a selected location
    map.panTo(new google.maps.LatLng(latitude, longitude));

    // Clicking on the Map moves the bouncing red marker
    google.maps.event.addListener(map, 'click', function(e){
        var marker = new google.maps.Marker({
            position: e.latLng,
            animation: google.maps.Animation.BOUNCE,
            map: map,
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });
        // When a new spot is selected, delete the old red bouncing marker
        if(lastMarker){
            lastMarker.setMap(null);
        }

        // Create a new red bouncing marker and move to it
        lastMarker = marker;
        map.panTo(marker.position);

        var geocoder = new google.maps.Geocoder();
        var infowindow = new google.maps.InfoWindow();
        var address;

        if (geocoder) {
            var latlng = e.latLng.lat()+","+e.latLng.lng();
            var latlngStr = latlng.split(',', 2);
            latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
            geocoder.geocode({'location': latlng}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        infowindow.setContent(results[0].formatted_address);
                        address = results[0].formatted_address.split(',')[0];
                        googleMapService.address = address;
                        $rootScope.$broadcast("clicked");
                    } else {
                        window.alert('No results found');
                    }
                } else {
                window.alert('Geocoder failed due to: ' + status);
                }
            });
        }
        infowindow.open(map,marker);

        // Update Broadcasted Variable (lets the panels know to change their lat, long values)
        googleMapService.clickLat = marker.getPosition().lat();
        googleMapService.clickLong = marker.getPosition().lng();        
    });
};

// Refresh the page upon window load. Use the initial latitude and longitude
google.maps.event.addDomListener(window, 'load', googleMapService.refresh(selectedLat, selectedLong));

return googleMapService;
});