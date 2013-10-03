
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
function init() {
    // Throw an error if no update is received every 3 seconds
    var options = { timeout: 3000 };
    centerOnMyLocation();
    // clearOldSofas();
    getSofas();
    watchID = navigator.geolocation.watchPosition(placeMarker, onError, options);
}

function pause(){
    clearOldSofas();
    navigator.geolocation.clearWatch(watchID);
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
    putSofaOnMap(position);
    saveSofa(position);
}

/**
 * Drop a sofa onto the map
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
 * Clear the sofas from the map
 */
function clearOldSofas() {
  for (var i = 0; i < sofas.length; i++ ) {
    sofas[i].setMap(null);
  }
  sofas = [];
}

/**
 * Save a sofa to the database of sofas
 */
function saveSofa(position){
    console.log(position);
    jx.load(config.postTo+'?key='+config.key+'&latitude='+position.coords.latitude+'&longitude='+position.coords.longitude,function(data){
        
    }, 'text', 'post', onError);
}

/**
 * Get sofas from the database of sofas
 */
function getSofas(){
    navigator.geolocation.getCurrentPosition(loadSofas, onError);
}

/**
 * Actually load the sofas onto the map
 */
function loadSofas(position){
    jx.load(config.getFrom+'?key='+config.key+'&latitude='+position.coords.latitude+'&longitude='+position.coords.longitude,function(data){
        for (var sofa in data) {
            if (data.hasOwnProperty(sofa)) {
                var temp = {
                    'coords':{
                        'latitude':data[sofa].latitude,
                        'longitude':data[sofa].longitude,
                    }
                }
                putSofaOnMap(temp);
            }
        }
    }, 'json');
}