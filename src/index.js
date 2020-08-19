import './style.scss';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import geojsonExtent from '@mapbox/geojson-extent';

window.DatoCmsPlugin.init((plugin) => {
  plugin.startAutoResizer();

  const { mapboxApiToken } = plugin.parameters.global;
  mapboxgl.accessToken = mapboxApiToken;

  const container = document.createElement('div');
  container.classList.add('container');
  container.id = 'map';
  document.body.appendChild(container);

  // Fit map to Europe http://bboxfinder.com/
  const boundsEurope = [
    [-10.255051, 41.155329],
    [31.602859, 54.934588],
  ];

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [
      (boundsEurope[0][0] + boundsEurope[0][1]) / 2,
      (boundsEurope[1][0] + boundsEurope[1][1]) / 2,
    ],
    zoom: 3,
  });

  map.addControl(new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
  }));
  map.addControl(new mapboxgl.NavigationControl(), 'top-left');

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
      data = JSON.parse(plugin.getFieldValue(plugin.fieldPath)) || {};
    } catch (error) {
      console.error('unable to parse initial value', error);
    }
    if (data.features) {
      draw.add(data);
      const bounds = geojsonExtent(data);
      map.fitBounds(bounds, { padding: 20 });
    } else {
      map.fitBounds(boundsEurope);
    }
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
