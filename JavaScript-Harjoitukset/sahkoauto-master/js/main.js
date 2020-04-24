'use strict';

const nimi = document.getElementById('nimi');
const osoite = document.getElementById('osoite');
const kaupunki = document.getElementById('kaupunki');
const lisatiedot = document.getElementById('lisatiedot');
const navigoi= document.getElementById('navigoi');

let paikka=null;

const map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Asetukset paikkatiedon hakua varten (valinnainen)
const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

// Funktio, joka ajetaan, kun paikkatiedot on haettu
function success(pos) {
  paikka = pos.coords;
  haeLatauspisteet(paikka);

  // Tulostetaan paikkatiedot konsoliin
  console.log('Your current position is:');
  console.log(`Latitude : ${paikka.latitude}`);
  console.log(`Longitude: ${paikka.longitude}`);
  console.log(`More or less ${paikka.accuracy} meters.`);

  // Käytetään leaflet.js -kirjastoa näyttämään sijainti kartalla (https://leafletjs.com/)
  map.setView([paikka.latitude, paikka.longitude], 13);
  lisaaMarker(paikka, 'Tässä olen');

}

// Funktio, joka ajetaan, jos paikkatietojen hakemisessa tapahtuu virhe
function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

// Käynnistetään paikkatietojen haku
navigator.geolocation.getCurrentPosition(success, error, options);
//TÄLLÄ SAA HAETTUA DATAA API:STA
function haeLatauspisteet (crd) {
  fetch(`https://api.openchargemap.io/v3/poi/?distance=10&distanceunit=KM&latitude=${crd.latitude}&longitude=${crd.longitude}`).then(function (vastaus) {
    return vastaus.json();
  }).then(function (latauspisteet) {
    //TÄSSÄ TEHDÄÄN SILLÄ TIEDOLLA JOTAIN
    console.log(latauspisteet);
    for (let x=0; x<latauspisteet.length;x++){
    const koordinaatit={latitude: latauspisteet[x].AddressInfo.Latitude, longitude: latauspisteet[x].AddressInfo.Longitude};
    const teksti=`<h3>${latauspisteet[x].AddressInfo.Title}</h3><p>${latauspisteet[x].AddressInfo.AddressLine1}</p><p>${latauspisteet[x].AddressInfo.Town}</p>`;


    lisaaMarker(koordinaatit, teksti, latauspisteet[x]);
    }
  }).catch(function (error) {
    console.log(error);
  });
}

function lisaaMarker(crd, teksti, latauspiste) {
  L.marker([crd.latitude, crd.longitude]).addTo(map).bindPopup(teksti).openPopup().on('click', function () {
    nimi.innerHTML= latauspiste.AddressInfo.Title;
    osoite.innerHTML= latauspiste.AddressInfo.AddressLine1;
    kaupunki.innerHTML= latauspiste.AddressInfo.Town;
    lisatiedot.innerHTML= latauspiste.AddressInfo.AccessComments;
    navigoi.href=`https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=${paikka.latitude},${paikka.longitude}&destination=${crd.latitude},${crd.longitude}`;
  });
}
