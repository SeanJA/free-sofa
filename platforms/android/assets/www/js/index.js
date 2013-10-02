
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
    mapTypeId: "OSM",
    mapTypeControl: false,
    streetViewControl: false
});

//Define OSM map type pointing at the OpenStreetMap tile server (is is possible to include all the tiles in the app?)
map.mapTypes.set("OSM", new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) {
        return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
    },
    tileSize: new google.maps.Size(256, 256),
    name: "OpenStreetMap",
    maxZoom: 15
}));

/**
 * Whether or not to follow the user on the map
 */
function toggleFollow(ele){
    follow = !follow;
    if(follow){
        ele.innerHTML = "Following";
    } else {
        ele.innerHTML = "Not Following";
    }
}



/**
 * Place the user marker
 */
function placeMarker(position) {
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
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}

/**
 * Initialize the maps and center on the phone's current location
 * 
 */
function initMaps() {
    // Throw an error if no update is received every 3 seconds
    var options = { timeout: 3000 };
    centerOnMyLocation();
    watchID = navigator.geolocation.watchPosition(placeMarker, onError, options);
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

    var sofaLatlng = positionLatLng(position);

    var sofa = new google.maps.Marker({
        position: sofaLatlng,
        map: map,
        icon: iconBase + 'sofa.png',
        title: "A Sofa",
        animation: google.maps.Animation.DROP
    });
    sofas.push(sofa);
    saveSofa(position);
}

function saveSofa(position){
    console.log(position);
    jx.load(config.postTo+'?key='+config.key+'&lat='+position.coords.latitude+'&lng='+position.coords.longitude,function(data){
        alert(data); // Do what you want with the 'data' variable.
    }, 'text', 'post', onError);
}