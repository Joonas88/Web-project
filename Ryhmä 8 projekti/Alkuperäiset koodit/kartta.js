'use strict';

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
    map.setView([paikka.latitude, paikka.longitude], 13);
    console.log(`Latitude: ${paikka.latitude}`);
    console.log(`Longitude: ${paikka.longitude}`);

    lisaaMarker(paikka, 'Minä olen tässä');
}
function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);

function lisaaMarker(crd, teksti) {
    L.marker([crd.latitude, crd.longitude]).addTo(map).bindPopup(teksti).openPopup().on('click', function () {
    });
}