import './style.scss';

import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

window.DatoCmsPlugin.init((plugin) => {
  plugin.startAutoResizer();

  mapboxgl.accessToken = 'pk.eyJ1Ijoic3RlZmFua29vbCIsImEiOiJjamxwNHBmYzEwNnU0M3FwbGx5OHduM3hyIn0.QYB7wWeUne1xuNWlFClzMg';

  const container = document.createElement('div');
  container.classList.add('container');
  container.setAttribute('id', 'map');

  document.body.appendChild(container);

  // Init mapbox map

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [11.607742, 48.084616], // starting position
    // zoom: 3,
  });

  // Fit map to Europe http://bboxfinder.com/
  map.fitBounds([
    [-10.255051, 41.155329],
    [31.602859, 54.934588],
  ]);

  // Add geocoder
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
  });

  map.addControl(geocoder);

  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl(), 'top-left');

  // Add polygon draw controls to the map.

  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      trash: true,
    },
  });

  map.addControl(draw, 'top-left');

  function loadFeatures() {
    let data = {};
    try {
      data = JSON.parse(plugin.getFieldValue(plugin.fieldPath));
    } catch (error) {
      console.error('unable to parse initial value', error);
    }
    draw.add(data);
  }

  function updateFeatures() {
    const data = draw.getAll();
    const features = JSON.stringify(data);
    plugin.setFieldValue(plugin.fieldPath, features);
  }

  map.on('load', loadFeatures);
  map.on('draw.create', updateFeatures);
  map.on('draw.delete', updateFeatures);
  map.on('draw.update', updateFeatures);
});
