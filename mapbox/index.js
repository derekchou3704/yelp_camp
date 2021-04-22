const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
 
mapboxgl.accessToken = 'pk.eyJ1IjoiZGVyZWtjaG91IiwiYSI6ImNrbnN3NG1laDA5bnUybnQ3dzkzZGk2OXkifQ.B-rrpCsG_v2EYJvRpi6Yww';
const map = new mapboxgl.Map({
container: 'YOUR_CONTAINER_ELEMENT_ID',
style: 'mapbox://styles/mapbox/streets-v11'
});