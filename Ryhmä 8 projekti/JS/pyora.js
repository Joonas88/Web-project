'use strict';

const nimi = document.getElementById('nimi');


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

const nappi = document.getElementById('nappi');

nappi.addEventListener('click', haepyorat);

function haepyorat() {
    hae(paikka);
}

function hae(crd) {
    const kysely = {
        query: `{
bikeRentalStations {
name
stationId
bikesAvailable
spacesAvailable
lat
lon
allowDropoff
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
        body: JSON.stringify(kysely),
    };

    fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', options).
    then(function(response){
        return response.json()
    }).then(function(tulos){
        console.log(tulos)
        for(let i = 0; i<tulos.length; i++) {
            const sijainti = {
                latitude: tulos[i].data.bikeRentalStation.lat,
                longitude: tulos[i].data.bikeRentalStation.long,
            };
            const teksti = `
        <h3>${tulos[i].data.bikeRentalStations.name}</h3>
        
        `;
            console.log(sijainti);
            lisaaMarker(sijainti, teksti, tulos[i]);
        }
    }).
    catch(function(error) {
        console.log(error);
    })
}

function lisaaMarker(crd, teksti, tuloos) {
    L.marker([crd.latitude, crd.longitude]).
    addTo(map).
    bindPopup(teksti).
    openPopup().
    on('click', function () {
        nimi.innerHTML = tuloos.data.RentalStations.name;
    });
}