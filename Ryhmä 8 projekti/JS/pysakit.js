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
    etsilinja(paikka);

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
    etsi(paikka);
}

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

function lisaaMarker(crd, teksti, hakutulos) {
    L.marker([crd.latitude, crd.longitude]).addTo(map).bindPopup(teksti).openPopup().on('click', function () {
        id.innerHTML =hakutulos.LYHYTTUNNU;
        nimi.innerHTML =hakutulos.NIMI1;
        namn.innerHTML =hakutulos.NAMN1;
    });
}

function etsilinja(crd) {
    const hakuteksti = document.getElementById('hakukenttä').value;
    console.log(hakuteksti);
    fetch(`https://services1.arcgis.com/sswNXkUiRoWtrx0t/arcgis/rest/services/HSL_linjat_kevat2018/FeatureServer/0/query?where=1%3D1&outFields=*&geometry=${crd.longitude}%2C${crd.latitude}%2C25.038%2C60.178&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelContains&distance=2&units=esriSRUnit_Kilometer&outSR=4326&f=json`).then(function (vastaus) {
        return vastaus.json();
    }).then(function (linjahaku) {
        console.log(linjahaku);
        //console.log(hakutulokset.features[0].attributes);

        //const pysakit= document.querySelector('main');
/*
        for (let x=0; x<hakutulokset.features.length; x++) {

            const koordinaatit = {latitude: hakutulokset.features[x].geometry.y, longitude: hakutulokset.features[x].geometry.x};
            const teksti=`<h3>${hakutulokset.features[x].attributes.LYHYTTUNNU}</h3><p>${hakutulokset.features[x].attributes.NIMI1}</p><p>${hakutulokset.features[x].attributes.NAMN1}</p>`;

            //pysakit.innerHTML += hakutulokset.features[x].attributes.LYHYTTUNNU+' '+hakutulokset.features[x].attributes.NIMI1+' '+hakutulokset.features[x].attributes.NAMN1+' '+hakutulokset.features[x].attributes.X+' '+hakutulokset.features[x].attributes.Y+'<br/>';
            //document.write(hakutulokset.features[x].attributes.LYHYTTUNNU+' '+hakutulokset.features[x].attributes.NIMI1+' '+hakutulokset.features[x].attributes.NAMN1+'<br/>');

            lisaaMarker(koordinaatit, teksti, hakutulokset.features[x].attributes);


        }

 */

    }).catch(function (error) {
        console.log(error);
    });
}