var _ = require('underscore');
var mapboxgl = require('mapbox-gl');
mapboxgl.accessToken = 'pk.eyJ1Ijoib3ZlcmJyeWQiLCJhIjoiY2l0MThjNHF1MDA3eTJ5bzM1aTdkZW42YSJ9.ikUfo17xm9iFCDSnDnc8hQ';
mapboxgl.Draw = require('mapbox-gl-draw');
var polylabel = require('polylabel');
var debounce = require('debounce');

var isSupported = require('mapbox-gl-supported')();
if (!isSupported) {
  // redirect to unsupported browser page
}

var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/overbryd/ciu2v77ug00lo2iqgxnvghaf1', //stylesheet location
  center: [13.439111709600411, 52.49052543049859], // starting position
  zoom: 14
});

var districts;
loadJSON('/lor_json/Bezirk_annotated.geojson', function(data) {
  districts = data;

  map.once('load', function() {
  });
});
var planungsraum;
loadJSON('/lor_json/Planungsraum_annotated.geojson', function(data) {
  planungsraum = data;
});

function windowResized() {
  currentScope()
};
window.addEventListener('resize', debounce(windowResized, 75));

function currentScope(id) {
  if (id) { this.id = id; } else { id = this.id }
  if (!id) { return }
  var feature = _.find(districts.features.concat(planungsraum.features), function(f) {
    return f.properties['id'] == id
  });
  var boundingBox = (feature.bbox = feature.bbox || getBoundingBox(feature));
  map.fitBounds(boundingBox, { padding: 20 });
  map.setFilter('planungsraum-fill', ['!=', 'id', id])
  map.setFilter('bezirk-fill', ['!=', 'id', id])
};

map.on('load', function() {
  map.on('mousemove', function(e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['planungsraum-interaction', 'bezirk-interaction'] });
    if (features.length) {
      var id = features[0].properties['id'];
    } else {
      map.setFilter('planungsraum-hover', ['==', 'id', ''])
      map.setFilter('bezirk-hover', ['==', 'id', ''])
    }
  });
  // reset districts-hover on mouseout
  map.on('mouseout', function(e) {
    map.setFilter('planungsraum-hover', ['==', 'id', '']);
    map.setFilter('bezirk-hover', ['==', 'id', '']);
  });

  // fit to district
  map.on('click', function(e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['planungsraum-interaction', 'bezirk-interaction'] });
    if (features.length) {
      var id = features[0].properties['id'];
      currentScope(id);
    }
  });
});

function getBoundingBox(feature) {
  var bounds = {}, points, latitude, longitude;

  points = feature.geometry.coordinates[0];

  for (var j = 0; j < points.length; j++) {
    longitude = points[j][0];
    latitude = points[j][1];
    bounds.xMin = bounds.xMin < longitude ? bounds.xMin : longitude;
    bounds.xMax = bounds.xMax > longitude ? bounds.xMax : longitude;
    bounds.yMin = bounds.yMin < latitude ? bounds.yMin : latitude;
    bounds.yMax = bounds.yMax > latitude ? bounds.yMax : latitude;
  }

  return [[bounds.xMin, bounds.yMin], [bounds.xMax, bounds.yMax]];
};

function loadJSON(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.overrideMimeType("application/json");
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == "200") {
      callback(JSON.parse(xhr.responseText));
    }
  };
  xhr.send(null);
};

