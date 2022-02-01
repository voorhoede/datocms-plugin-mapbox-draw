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

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json, .geojson';
  fileInput.classList.add('file-input');
  fileInput.id = 'file-input';
  // This actually inserts the input after the container
  container.parentNode.insertBefore(fileInput, container.nextSibling);

  // Fit map to Europe http://bboxfinder.com/
  const boundsEurope = [
    [-10.255051, 41.155329],
    [31.602859, 54.934588],
  ];

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-v9',
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

  function addFeatures(features) {
    draw.add(features);
    const allFeatures = draw.getAll();
    const bounds = geojsonExtent(allFeatures);
    map.fitBounds(bounds, { padding: 20 });
  }

  function loadFeatures() {
    let data = {};
    try {
      data = JSON.parse(plugin.getFieldValue(plugin.fieldPath)) || {};
    } catch (error) {
      console.error('unable to parse initial value', error);
    }
    if (data.features) {
      addFeatures(data);
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

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const fileType = file.name.split('.').pop();
    const reader = new FileReader();

    reader.onload = (e) => {
      const fileData = e.target.result;

      if (fileType === 'json' || fileType === 'geojson') {
        const features = JSON.parse(fileData);
        addFeatures(features);
      }
    };

    reader.readAsText(file);
  });
});
