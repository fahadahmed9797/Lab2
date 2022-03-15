// configuring date picker
const picker = new Litepicker({
  element: document.getElementById('date'),
  parentEl: '#calendar-wrapper',
  inlineMode: true, // to always display calendar
  autoApply: true,
  autoRefresh: true,
  singleMode: false,
  delimiter: ',',
  format: 'YYYY-MM-DD',
  dropdowns: {
    minYear: 1980,
    maxYear: null,
    months: true,
    years: true,
  },
});

// configuring leaflet map
let map = L.map('map').setView([51.055263, -114.070847], 13);
L.tileLayer(
  'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken:
      'pk.eyJ1IjoiY2hyaXN0aWFuYmVybmFsIiwiYSI6ImNrbGNtejJxdzJ3eTQydnBlNnJuc3I2cXEifQ.V32yro03000Yc41qqC226g',
  }
).addTo(map);

// mapbox://styles/fahadahmed551/ckzzromso00b115lwdvy1nb87
const trafficData = L.tileLayer(
  'https://api.mapbox.com/styles/v1/fahadahmed551/ckzzromso00b115lwdvy1nb87/tiles/{z}/{x}/{y}?access_token={accessToken}',
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    tileSize: 512,
    zoomOffset: -1,
    accessToken:
      'pk.eyJ1IjoiZmFoYWRhaG1lZDU1MSIsImEiOiJja3pvbzBjOXMzNDBiMm9uMmZmam9xdmVrIn0.nR9sqKt9OYrwUd00XB2J5g',
  }
);

// variables we need for later
const btn = document.getElementById('getDate');
const date = document.getElementById('date');
const data = document.getElementById('traffic');
let dataToggle = false;
let dates,
  baseUrl =
    'https://data.calgary.ca/resource/c2es-76ed.geojson?$$app_token=LsCgAMajefqUpvGRQlkm2eXqJ',
  markers = L.markerClusterGroup();

// when the user clicks the submit button, we fetch data from the calgary API
btn.addEventListener('click', function () {
  if (markers.getLayers().length > 0) {
    markers.clearLayers();
    markers = L.markerClusterGroup();
  }
  // get the two dates and parse them from the date text input
  dates = date.value.split(',');

  // forming the url to fetch from
  let url = `${baseUrl}&$where=issueddate%20%3E%20%27${dates[0]}%27%20and%20issueddate%20%3C%20%27${dates[1]}%27&$select=issueddate,workclassgroup,contractorname,communityname,originaladdress,locationsgeojson`;

  // fetching data from the calgary API
  fetch(url)
    .then(response => response.json()) // parsing the data
    .then(data => {
      // iterating over the data
      for (const feature of data.features) {
        let geojson;

        // if there is no geojson location we skip
        if (feature.properties.locationsgeojson === null) continue;
        else {
          // parsing the geojson data
          geojson = JSON.parse(feature.properties.locationsgeojson);

          // if data point is a single point
          if (geojson.type === 'Point') {
            let marker = L.marker([
              geojson.coordinates[1],
              geojson.coordinates[0],
            ]);
            let issueddate = feature.properties.issueddate.substring(
              0,
              feature.properties.issueddate.indexOf('T')
            );
            let workclassgroup = feature.properties.workclassgroup;
            let contractorname = feature.properties.contractorname;
            let communityname = feature.properties.communityname;
            let originaladdress = feature.properties.originaladdress;

            marker.bindPopup(
              `<p>issueddate: ${issueddate}</p> 
                <p>workclassgroup: ${workclassgroup}</p>
                <p>contractorname: ${contractorname}</p>
                <p>communityname: ${communityname}</p>
                <p>originaladdress: ${originaladdress}</p>`
            );
            markers.addLayer(marker);
          } else if (geojson.type === 'MultiPoint') {
            for (const point of geojson.coordinates) {
              let marker = L.marker([point[1], point[0]]);
              let issueddate = feature.properties.issueddate.substring(
                0,
                feature.properties.issueddate.indexOf('T')
              );
              let workclassgroup = feature.properties.workclassgroup;
              let contractorname = feature.properties.contractorname;
              let communityname = feature.properties.communityname;
              let originaladdress = feature.properties.originaladdress;

              marker.bindPopup(
                `<p>issueddate: ${issueddate}</p> 
                <p>workclassgroup: ${workclassgroup}</p>
                <p>contractorname: ${contractorname}</p>
                <p>communityname: ${communityname}</p>
                <p>originaladdress: ${originaladdress}</p>`
              );
              markers.addLayer(marker);
            }
          }
        }
      }
      map.addLayer(markers);
    });
});
data.addEventListener('click', function () {
  if (!dataToggle) {
    trafficData.addTo(map);
    dataToggle = true;
  } else {
    trafficData.removeFrom(map);
    dataToggle = false;
  }
});