'use strict';

const id = document.getElementById('id');
const nimi = document.getElementById('nimi');
const namn = document.getElementById('namn');

let paikka = null;

const map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

function success(pos) {
    paikka = pos.coords;

    console.log(`Latitude: ${paikka.latitude}`);
    console.log(`Longitude: ${paikka.longitude}`);

    map.setView([paikka.latitude, paikka.longitude], 13);

    lisaaMarker(paikka, 'Minä olen tässä');
}
function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);

const hakunappi = document.getElementById('hakunappi');

hakunappi.addEventListener('click', napinpano);

function napinpano() {
    //etsi(paikka);
    pysakit(paikka);
}

function pysakit (crd) {
    const hakuteksti = document.getElementById('hakukenttä').value;
    console.log(hakuteksti);

    const pysakkiKysely = {
        query: `{
    stopsByRadius(lat:${crd.latitude},lon:${crd.longitude},radius:${hakuteksti}) {
      edges {
        node {
          stop { 
            gtfsId 
            name
            lat
            lon
                patterns {
      code
      directionId
      headsign
      route {
        gtfsId
        shortName
        longName
        mode
      }
    }
          }
          distance
        }
      }
    }
}`
    };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify(pysakkiKysely),
    };

    fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', options).then(function (response) {
        return response.json()
    }).then(function (tulos) {
        console.log(tulos);
        for (let x = 0; x < tulos.data.stopsByRadius.edges.length; x++) {
            console.log(tulos.data.stopsByRadius.edges[x].node.stop.name+' '+tulos.data.stopsByRadius.edges[x].node.distance+'m päässä');
            const koordinaatit = {latitude: tulos.data.stopsByRadius.edges[x].node.stop.lat, longitude: tulos.data.stopsByRadius.edges[x].node.stop.lon};

            //document.write('<br/>' + tulos.data.stopsByRadius.edges[x].node.stop.name+' '+tulos.data.stopsByRadius.edges[x].node.distance+'m päässä<br/>');
            for (let i = 0; i < tulos.data.stopsByRadius.edges[x].node.stop.patterns.length; i++) {
                console.log(tulos.data.stopsByRadius.edges[x].node.stop.patterns[i].route.shortName + ' ' + tulos.data.stopsByRadius.edges[x].node.stop.patterns[i].headsign);
                const teksti=`<h3>${tulos.data.stopsByRadius.edges[x].node.stop.name}</h3><p>${tulos.data.stopsByRadius.edges[x].node.stop.patterns[i].route.shortName}</p><p>${tulos.data.stopsByRadius.edges[x].node.stop.patterns[i].headsign}</p>`;
                //document.write(tulos.data.stopsByRadius.edges[x].node.stop.patterns[i].route.shortName + ' ' + tulos.data.stopsByRadius.edges[x].node.stop.patterns[i].headsign + '<br/>');
                lisaaMarker(koordinaatit, teksti, tulos.data.stopsByRadius.edges[x].node.stop, tulos.data.stopsByRadius.edges[x].node.stop.patterns[i]);
            }

        }
    });
}

function lisaaMarker(crd, teksti, hakutulos, hakutulos2) {
    L.marker([crd.latitude, crd.longitude]).addTo(map).bindPopup(teksti).openPopup().on('click', function () {
        id.innerHTML =hakutulos.name;
        nimi.innerHTML =hakutulos2.route.shortName;
        namn.innerHTML =hakutulos2.headsign;
    });
}

/*
function etsi(crd) {
    const hakuteksti = document.getElementById('hakukenttä').value;
    console.log(hakuteksti);
    fetch(`https://services1.arcgis.com/sswNXkUiRoWtrx0t/arcgis/rest/services/HSL_pysakit_kevat2018/FeatureServer/0/query?where=1%3D1&outFields=*&geometry=${crd.longitude}%2C${crd.latitude}%2C25.137%2C60.239&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelContains&distance=1&units=esriSRUnit_Kilometer&outSR=4326&f=json`).then(function (vastaus) {
        return vastaus.json();
    }).then(function (hakutulokset) {
        console.log(hakutulokset.features);
        console.log(hakutulokset.features[0].attributes);

        const pysakit= document.querySelector('main');

        for (let x=0; x<hakutulokset.features.length; x++) {

            const koordinaatit = {latitude: hakutulokset.features[x].geometry.y, longitude: hakutulokset.features[x].geometry.x};
            const teksti=`<h3>${hakutulokset.features[x].attributes.LYHYTTUNNU}</h3><p>${hakutulokset.features[x].attributes.NIMI1}</p><p>${hakutulokset.features[x].attributes.NAMN1}</p>`;

            //pysakit.innerHTML += hakutulokset.features[x].attributes.LYHYTTUNNU+' '+hakutulokset.features[x].attributes.NIMI1+' '+hakutulokset.features[x].attributes.NAMN1+' '+hakutulokset.features[x].attributes.X+' '+hakutulokset.features[x].attributes.Y+'<br/>';
            //document.write(hakutulokset.features[x].attributes.LYHYTTUNNU+' '+hakutulokset.features[x].attributes.NIMI1+' '+hakutulokset.features[x].attributes.NAMN1+'<br/>');

            lisaaMarker(koordinaatit, teksti, hakutulokset.features[x].attributes);
        }

    }).catch(function (error) {
        console.log(error);
    });
}
 */

/*
function etsilinja(crd) {
    const hakuteksti = document.getElementById('hakukenttä').value;
    console.log(hakuteksti);
    fetch(`https://services1.arcgis.com/sswNXkUiRoWtrx0t/arcgis/rest/services/HSL_linjat_kevat2018/FeatureServer/0/query?where=1%3D1&outFields=*&geometry=${crd.longitude}%2C${crd.latitude}%2C25.038%2C60.178&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelContains&distance=2&units=esriSRUnit_Kilometer&outSR=4326&f=json`).then(function (vastaus) {
        return vastaus.json();
    }).then(function (linjahaku) {
        console.log(linjahaku);
        //console.log(hakutulokset.features[0].attributes);

        //const pysakit= document.querySelector('main');

        for (let x=0; x<hakutulokset.features.length; x++) {

            const koordinaatit = {latitude: hakutulokset.features[x].geometry.y, longitude: hakutulokset.features[x].geometry.x};
            const teksti=`<h3>${hakutulokset.features[x].attributes.LYHYTTUNNU}</h3><p>${hakutulokset.features[x].attributes.NIMI1}</p><p>${hakutulokset.features[x].attributes.NAMN1}</p>`;

            //pysakit.innerHTML += hakutulokset.features[x].attributes.LYHYTTUNNU+' '+hakutulokset.features[x].attributes.NIMI1+' '+hakutulokset.features[x].attributes.NAMN1+' '+hakutulokset.features[x].attributes.X+' '+hakutulokset.features[x].attributes.Y+'<br/>';
            //document.write(hakutulokset.features[x].attributes.LYHYTTUNNU+' '+hakutulokset.features[x].attributes.NIMI1+' '+hakutulokset.features[x].attributes.NAMN1+'<br/>');

            lisaaMarker(koordinaatit, teksti, hakutulokset.features[x].attributes);


        }



    }).catch(function (error) {
        console.log(error);
    });
}

 */


