
    // the gps watch identifier
var watchID = null,
    // the user's marker
    marker = null,
    // the div that holds the map
    mapBox = null,
    // is this the first call to place marker?
    first = true,
    // are we following the user around?
    follow = true,
    // store the sofas here
    sofas = [],
    // base url for the icons
    iconBase = 'img/',
    // the map object
    map = null;

//Google maps API initialisation
mapBox = document.getElementById("map");

//Define the properties of the OSM map to be displayed
map = new google.maps.Map(mapBox, {
    center: new google.maps.LatLng(57, 21),
    zoom: 13,
    // mapTypeId: "OSM",
    mapTypeControl: false,
    streetViewControl: false
});

/**
 * Whether or not to follow the user on the map
 */
function toggleFollow(){
    var ele = document.getElementById('follow');
    follow = !follow;
    if(follow){
        centerOnMyLocation();
        ele.className += ' active';
    } else {
        removeClass(ele, 'active');
    }
}

function hasClass(ele,cls) {
    return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}

function removeClass(ele,cls) {
    if (hasClass(ele,cls)) {
        var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
        ele.className=ele.className.replace(reg,' ');
    }
}

/**
 * Place the user marker
 */
function placeMarker(position) {
    // alert('place_marker');
    if(marker){
        marker.setMap(null);
    }
    var yourLatlng = positionLatLng(position);

    marker = new google.maps.Marker({
        position: yourLatlng,
        map: map,
        title:"You"
    });

    if(first || follow){
        first = false;
        map.setCenter(yourLatlng);
    }
}

/**
 * Helper function to convert a position to a google latLng object
 */
function positionLatLng(position){
    return new google.maps.LatLng(position.coords.latitude,position.coords.longitude)
}

/**
 * Center the map on the user's current location
 */
function centerOnMyLocation(){
    first = true;
    navigator.geolocation.getCurrentPosition(placeMarker, onError);
}

/**
 * Display the error message
 */
function onError(error) {
    //not sure what to do on error...
    alert(error.toString());
}

/**
 * Initialize the maps and center on the phone's current location
 * 
 */
function initApp() {
    centerOnMyLocation();
    getSofas();
    trackUser();
    addMapEvents();
    addDeviceEvents();
    if(navigator.splashscreen){
        navigator.splashscreen.hide();
    }
}

/**
 * Add the map events
 */
function addMapEvents(){
    //stop the following on drag
    google.maps.event.addListener(map, 'drag', function() { 
        if(follow){
            toggleFollow();
        }
    });
}

/**
 * Add the device events
 */
function addDeviceEvents(){
    // pause the tracker on device pause
    document.addEventListener("pause", function(){
        window.clearInterval(watchID);
        watchID = null;
    }, false);
    // resume the tracker on resume
    document.addEventListener("resume", function(){
        trackUser();
    }, false);
}

/**
 * Track the user's position
 */
function trackUser(){
    var timeout = 3000;
    watchID = window.setInterval(function(){
        navigator.geolocation.getCurrentPosition(placeMarker, onError, timeout)
    });
}

/**
 * Get the phone's current position, place a sofa there
 */
function foundSofa(){
    navigator.geolocation.getCurrentPosition(placeSofa, onError);
}

/**
 * Drop a sofa in the current position
 * @param position (a position object)
 */
function placeSofa(position) {
    saveSofa(position);
}

/**
 * Put a sofa on the map
 */
function putSofaOnMap(position){
    var sofaLatlng = positionLatLng(position);
    var sofa = new google.maps.Marker({
        position: sofaLatlng,
        map: map,
        icon: iconBase + 'sofa.png',
        title: "A Sofa",
        animation: google.maps.Animation.DROP
    });
    sofas.push(sofa);
}

/**
 * Save the sofa back to the central location
 */
function saveSofa(position){
    jx.load(config.postTo+'?key='+config.key+'&latitude='+position.coords.latitude+'&longitude='+position.coords.longitude,function(data){
        putSofaOnMap(position);
    }, 'text', 'post', onError);
}

function getSofas(){
    navigator.geolocation.getCurrentPosition(loadSofas, onError);
}

function loadSofas(position){
    jx.load(config.getFrom+'?key='+config.key+'&latitude='+position.coords.latitude+'&longitude='+position.coords.longitude,function(data){
        for (var sofa in data) {
            if (data.hasOwnProperty(sofa)) {
                var temp = coordsToPosition(data[sofa]);
                putSofaOnMap(temp);
            }
        }
    }, 'json', 'get');
}

/**
 * Convert a set of coordinates to a position object
 */
function coordsToPosition(data){
    return {
        'coords':{
            'latitude':data.latitude,
            'longitude':data.longitude,
        }
    }
}