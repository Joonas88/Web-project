'use strict';

const nimi = document.getElementById('nimi');
const nappi = document.getElementById('nappi');
const pyorahaku = document.getElementById('pyorahaku');
pyorahaku.checked = true;

let paikka = null;

const pyoraIkoni = L.icon({
    iconUrl: 'media/Bikeicon.png',
    iconSize: [40,40],
    iconAnchor: [10,30],
    popupAnchor: [10,-30]
});

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

    minaOlenTassa(paikka, 'Minä olen tässä');
}
function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);



nappi.addEventListener('click', haepyorat);

function haepyorat() {
    if(pyorahaku.checked === true) {
        hae(paikka);
    } else {
        location.reload(paikka);
    }

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
        for(let i = 0; i<tulos.data.bikeRentalStations.length; i++) {
            const sijainti = {
                latitude: tulos.data.bikeRentalStations[i].lat,
                longitude: tulos.data.bikeRentalStations[i].lon,
            };

            const teksti = `
        <h3>${tulos.data.bikeRentalStations[i].name}</h3>
        <p>Aseman ID:${bikeInfo.data.bikeRentalStations[i].stationId}</p>
        <p>Vapaita pyöriä:${bikeInfo.data.bikeRentalStations[i].bikesAvailable}</p>
        <p>Vapaita paikkoja:${bikeInfo.data.bikeRentalStations[i].spacesAvailable}</p>
        <p>Tilaa palauttaa:${bikeInfo.data.bikeRentalStations[i].allowDropoff}</p>
        `;
            console.log(sijainti);
            pyoraMarker(sijainti, teksti, tulos[i]);
        }
    }).
    catch(function(error) {
        console.log(error);
    })
}
function minaOlenTassa(crd, teksti) {
    L.marker([crd.latitude, crd.longitude]).addTo(map).bindPopup(teksti).openPopup().on('click', function () {

    });
}
function pyoraMarker(crd, teksti, tuloos) {
    L.marker([crd.latitude, crd.longitude], {icon: pyoraIkoni}).
    addTo(map).
    bindPopup(teksti).
    openPopup().
    on('click', function () {
        navigoi.href=`https://www.openstreetmap.org/directions?engine=graphhopper_foot&route=${paikka.latitude}%2C${paikka.longitude}%3B${crd.latitude}%2C${crd.longitude}`;
        nimi.innerHTML = tuloos.data.RentalStations.name;
    });
}