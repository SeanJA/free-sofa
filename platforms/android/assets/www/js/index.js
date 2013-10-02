
var watchID = null,
    marker = null,
    mapBox = null,
    first = true,
    follow = true,
    sofas = [],
    iconBase = 'img/';

function toggleFollow(ele){
    follow = !follow;
    if(follow){
        ele.innerHTML = "Following";
    } else {
        ele.innerHTML = "Not Following";
    }
}

//Google maps API initialisation
mapBox = document.getElementById("map");

//Define the properties of the OSM map to be displayed
var map = new google.maps.Map(mapBox, {
    center: new google.maps.LatLng(57, 21),
    zoom: 13,
    mapTypeId: "OSM",
    mapTypeControl: false,
    streetViewControl: false
});

//Define OSM map type pointing at the OpenStreetMap tile server
map.mapTypes.set("OSM", new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) {
        return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
    },
    tileSize: new google.maps.Size(256, 256),
    name: "OpenStreetMap",
    maxZoom: 15
}));

// onSuccess Callback
//   This method accepts a `Position` object, which contains
//   the current GPS coordinates
//
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

function positionLatLng(position){
    return new google.maps.LatLng(position.coords.latitude,position.coords.longitude)
}

function centerOnMyLocation(){
    first = true;
    navigator.geolocation.getCurrentPosition(placeMarker, onError);
}

// onError Callback receives a PositionError object
//
function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}

function initMaps() {
    // Throw an error if no update is received every 3 seconds
    var options = { timeout: 3000 };
    centerOnMyLocation();
    watchID = navigator.geolocation.watchPosition(placeMarker, onError, options);
}

function foundSofa(){
    navigator.geolocation.getCurrentPosition(placeSofa, onError);
}

// onSuccess Callback
//   This method accepts a `Position` object, which contains
//   the current GPS coordinates
//
function placeSofa(position) {

    var sofaLatlng = positionLatLng(position);

    var sofa = new google.maps.Marker({
        position: sofaLatlng,
        map: map,
        icon: iconBase + 'sofa.png',
        title: "A Sofa",
        animation: google.maps.Animation.DROP
    });
    google.maps.event.addListener(sofa, 'tap', toggleBounce);
    sofas.push(sofa);
}


function toggleBounce(marker) {
  if (marker.getAnimation() != null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}