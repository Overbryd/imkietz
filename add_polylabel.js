var polylabel = require('polylabel');
var _ = require('underscore');
var fs = require('fs');

var text = fs.readFileSync('lor_json/Planungsraum_annotated.geojson');
var geojson = JSON.parse(text);

var features = [];

_.each(geojson.features, function(feature) {
  var point = {
    type: "Feature",
    properties: feature.properties,
    geometry: {
      type: "Point",
      coordinates: polylabel(feature.geometry.coordinates, 1.0)
    }
  };
  features.push(point);
});


var result = {
  type: "FeatureCollection",
  crs: {
    type: "name",
    properties: {
      name: "urn:ogc:def:crs:OGC:1.3:CRS84"
    }
  },
  features: features
};
console.log(JSON.stringify(result));

