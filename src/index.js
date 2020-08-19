import './style.scss';

import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

window.DatoCmsPlugin.init((plugin) => {
  plugin.startAutoResizer();

  mapboxgl.accessToken = 'pk.eyJ1Ijoic3RlZmFua29vbCIsImEiOiJjamxwNHBmYzEwNnU0M3FwbGx5OHduM3hyIn0.QYB7wWeUne1xuNWlFClzMg';

  const container = document.createElement('div');
  container.classList.add('container');
  container.setAttribute('id', 'map');

  document.body.appendChild(container);

  // Link mapbox styles

  // Get HTML head element
  const head = document.getElementsByTagName('HEAD')[0];

  // Create new link Elements
  const linkDefault = document.createElement('link');
  const linkDraw = document.createElement('link');

  linkDefault.rel = 'stylesheet';
  linkDefault.type = 'text/css';
  linkDefault.href = 'https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css';
  head.appendChild(linkDefault);

  linkDraw.rel = 'stylesheet';
  linkDraw.type = 'text/css';
  linkDraw.href = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.2.0/mapbox-gl-draw.css';
  head.appendChild(linkDraw);

  // Init mapbox map

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [4.47917, 51.9225], // starting position
    zoom: 14, // starting zoom
  });

  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl());

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
