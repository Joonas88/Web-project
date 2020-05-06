'use strict';

let paikka = null;

//Julkisten kulkuneuvojen muuttujat
const pysakki = document.getElementById('pysakkiNimi');
const lahto = document.getElementById('pysakkidata');
const linjaNRO = document.getElementById('pysakkidata2');
const junareitti = document.getElementById('pysakkidata3');
const nakyva = document.getElementById('julkisetMarker');
const hakunappi = document.getElementById('hakunappi');
const pudotusValikko = document.getElementById('valinta');
const vyohykeKuva = document.getElementById('vyohykeKuva');
const taulukko = document.getElementById('helsinkiRautatieasema');
const pyoraTulostus = document.getElementById('pyoraHakuhtml');
let maaranpaaLista = [];
let junatunnuslista = [];
let lista = [];
const aika = document.getElementById('aika');
const juna = document.getElementById('juna');
const suunta = document.getElementById('suunta');
const raide = document.getElementById('raide');

//Kaupunkipyörähaun muuttujat
const nimi = document.getElementById('nimi');
const stationid = document.getElementById('stationid');
const bikes = document.getElementById('bikes');
const allow = document.getElementById('allow');
const spaces = document.getElementById('spaces');

//Reittihaun muuttujat
const reittiOhjeistus = document.getElementById('reittiohje');
const reittiHaku = document.getElementById('reittihakuvalikko');
const haeReitti = document.getElementById('haeReitti');
const ohjeet = document.getElementById('ohjeet');
const matka = document.getElementById('matka');
let polyline=null;
let latlngs = [];



let tumma = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }),
    osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }),
    ilma = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }),
    hsl = L.tileLayer('https://cdn.digitransit.fi/map/v1/{id}/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    maxZoom: 19,
    tileSize: 512,
    zoomOffset: -1,
    id: 'hsl-map'});

const map = L.map('map', {
    layers: [tumma, osm, ilma, hsl]
});
let baseMaps = {
    "Tumma": tumma,
    "OSM": osm,
    "Ilma": ilma,
    "HSL": hsl
};
L.control.layers(baseMaps).addTo(map);

const options = { //Kartan asetuksia joilla määritetään sijainnin tarkuuden tarkkuus
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};
//Helsingin rautatieasmean koordinaatit:lat:60.171040,lon: 24.941957
function success(pos) { //Funktiolla ajetaan käyttäjän sijainti kartalle
    paikka = pos.coords;

    console.log(`Latitude: ${paikka.latitude}`);
    console.log(`Longitude: ${paikka.longitude}`);

    map.setView([paikka.latitude, paikka.longitude], 13);
    minaOlenTassa(paikka,'Minä olen tässä!');
}

function error(err) { //Virheen sattuessa ajetaan tämä funktio ja tulostetaan virheestä johtuva data konsoliin
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options); //Tämä ominaisuus hakee käyttäjän sijainnin

hakunappi.addEventListener('click', napinpano);

function napinpano() { //Funktiolla määritellään mitä tapahtuu hakunappia painettaessa

    switch (pudotusValikko.selectedIndex) { //Switch-case määrittää mikä pudostusvalikon atribuutti on käytössä ja default päivittä kartan
        case 1:
            pysakit(paikka);
            break;
        case 2:
            pysakointiPaikat(paikka);
            break;
        case 3:
            hae(paikka);
            break;
        default:
            pyyhiMarker();
            break;
    }
    junaTiedot1(); //Helsingin rauatieasemaa koskevien aikataulutietojen haku suoritetaan aina nappia painaessa
}

function pyyhiMarker(){ //Funktio päivittää sivuston
    console.log('Päivitetään sivu');
    location.reload(paikka);
}


function minaOlenTassa(crd, teksti) { //Tämä funktio tulostaa markerin kartalle oman sijainnin kohdalle ja avaa popupin, joka myös aukeaa markeria klikattaessa.
    L.marker([crd.latitude, crd.longitude], {icon: omaIkoni}).addTo(map).bindPopup(teksti).openPopup()
}

function clear() { //Funktio tyhjentää HTML-näkymän ennen uudelleenkirjoitusta
    lahto.innerHTML='';
    linjaNRO.innerHTML='';
    junareitti.innerHTML='';
    aika.innerHTML='';
    juna.innerHTML='';
    suunta.innerHTML='';
    raide.innerHTML='';
    nimi.innerHTML='';
    stationid.innerHTML='';
    bikes.innerHTML='';
    allow.innerHTML='';
    spaces.innerHTML='';
}

/**
 * @author Joonas Soininen
 */

const bussiIkoni = L.icon({ //Luodaan omille ikoneille muuttujat, joita voidaan käyttää myöhemmin leaflet-kirjaton ikonin sijasta
    iconUrl: 'media/Bussicon.png', //Määritetään lähde, ikonin koko, ankkurointi ikoniin nähden ja popup-ankkurointi
    iconSize: [40,40],
    iconAnchor: [10,30],
    popupAnchor: [10,-30]
});

const ratikkaIkoni = L.icon({
    iconUrl: 'media/Sporaicon.png',
    iconSize: [40,40],
    iconAnchor: [10,30],
    popupAnchor: [10,-30]
});

const junaIkoni = L.icon({
    iconUrl: 'media/Junaicon.png',
    iconSize: [40,40],
    iconAnchor: [10,30],
    popupAnchor: [10,-30]
});

const metroIkoni = L.icon({
    iconUrl: 'media/Metroicon.png',
    iconSize: [40,40],
    iconAnchor: [10,30],
    popupAnchor: [10,-30]
});

const omaIkoni = L.icon({
    iconUrl: 'media/Omasijainti.png',
    iconSize: [40,40],
    iconAnchor: [15,30],
    popupAnchor: [5,-30]
});

const parkkiIkoni = L.icon({
    iconUrl: 'media/Parkkicon.png',
    iconSize: [40,40],
    iconAnchor: [15,30],
    popupAnchor: [5,-20]
});

const pyoraParkkiIkoni = L.icon({
    iconUrl: 'media/Bikepark1.png',
    iconSize: [40,40],
    iconAnchor: [15,30],
    popupAnchor: [5,-30]
});

//Helsingin rautatieasmean koordinaatit:lat:60.171040,lon: 24.941957
//Tikkurila Heurekan koordinaatit:lat:60.287520,lon: 25.040841
//Pasia koordinaatit:lat:60.198008,lon:24.933722
// kartan toiminnallisuuden testaamista varten

function pysakit (crd) { //Funktiolla haetaan API:sta dataa, tässä tapauksessa pysäkkien sijaintitietoja
    const pysakkiKysely = { //Annetaan hakuun parametrit, mitä tietoja rajapinnasta haetaan, käytetään omaa sijaintia sekä 500m sädettä tuloksien rajaamiseen
        query: `{
    stopsByRadius(lat:${crd.latitude},lon: ${crd.longitude},radius:1000) { 
      edges {
        node {
          stop { 
            gtfsId 
            zoneId
            vehicleMode
            name
            lat
            lon
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

    fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', options).then(function (response) { //Rajapinnasta nouto
        return response.json()
    }).then(function (pysakit) { //Tässä on haettu data tulos-muuttujan muodossa

        //console.log(pysakit);
        for (let x = 0; x < pysakit.data.stopsByRadius.edges.length; x++) { //Rajapinnan tulos iteroidaan sieltä löytyvän Arrayn pituuden mukaan ja annetaan muuttujille halutut arvot

            //console.log(tulos.data.stopsByRadius.edges[x].node.stop.gtfsId+' '+tulos.data.stopsByRadius.edges[x].node.stop.name+' '+tulos.data.stopsByRadius.edges[x].node.distance+'m päässä');
            //console.log(pysakit.data.stopsByRadius.edges[x].node.stop.vehicleMode);

            const koordinaatit = {latitude: pysakit.data.stopsByRadius.edges[x].node.stop.lat, longitude: pysakit.data.stopsByRadius.edges[x].node.stop.lon}; //Tässä tapauksessa koordinaatit ja toiselle pysäkin nimi ja etäisyys käyttäjästä
            const teksti=`<h4>${pysakit.data.stopsByRadius.edges[x].node.stop.name+' '+pysakit.data.stopsByRadius.edges[x].node.distance+'m päässä'}</h4>`;

            if (pysakit.data.stopsByRadius.edges[x].node.stop.vehicleMode==='TRAM'){ //Tuloksista riippuen kutsutaan toista funktiota jole lähetetään saatuja arjova, sekä lisänä pysäkkien ID
                sporaMarker(koordinaatit, teksti, pysakit.data.stopsByRadius.edges[x].node.stop.gtfsId);
            } else if (pysakit.data.stopsByRadius.edges[x].node.stop.vehicleMode==='RAIL') {
                junaMarker(koordinaatit, teksti, pysakit.data.stopsByRadius.edges[x].node.stop.gtfsId);
            } else if (pysakit.data.stopsByRadius.edges[x].node.stop.vehicleMode==='SUBWAY'){
                metroMarker(koordinaatit, teksti, pysakit.data.stopsByRadius.edges[x].node.stop.gtfsId);
            } else {
                bussiMarker(koordinaatit, teksti, pysakit.data.stopsByRadius.edges[x].node.stop.gtfsId);
            }

        }
    });
}

function kulkuneuvot (pysakkiId) { //Funktiolla haetaan API:sta dataa, tässä tapauksessa edellä haettujen pysäkkien kautta kulkevia linjoja, käyttäen pysäkkiId parametriä joka on määritetty toisessa funktiossa
    console.log(pysakkiId);
    const  kulkuneuvot = {
        query: `{
  stop(id: "${pysakkiId}") {
    name
    gtfsId
    platformCode
    zoneId
      stoptimesWithoutPatterns {
      scheduledArrival
      realtimeArrival
      arrivalDelay
      scheduledDeparture
      realtimeDeparture
      departureDelay
      realtime
      realtimeState
      serviceDay
      headsign
        trip {
            route {
            gtfsId
            mode
            shortName
            longName
            }
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
        body: JSON.stringify(kulkuneuvot),
    };

    fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', options).then(function (response) {
        return response.json()
    }).then(function (pysakkiInfo) { //API palauttaa listan linjoista jotka kulkevat halutun pysäkin läpi
        //console.log(pysakkiInfo);

        for (let x=0; x<pysakkiInfo.data.stop.stoptimesWithoutPatterns.length; x++){ //Iteroidaan API:sta saatu tieto

            /*
            console.log(pysakkiInfo.data.stop.zoneId);
            console.log(pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].trip.route.gtfsId);
            console.log(pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].trip.route.shortName+' '+pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].headsign+' '+aikaLeima);
            console.log(pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].headsign);
             */
            const aikaLeima = new Date((pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].serviceDay+pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].realtimeDeparture)*1000).toLocaleTimeString("fi-FI"); //Muuttujalle määritellään API:sta saatu aikatieto ja muunnetaan se ihmisen luettavaan kellonaikaan
            //API palauttaa UNIX aikamuotoa, eli sekunteja pisteestä X, tässä tapauksessa keskiyöstä nykyhetkeen.

            let maaranpaa = null;

            if (pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].headsign===null){ //Määränpää linjalla voi olla tietyissä tilantessa NULL, menossa varikolle tai lopettamassa linjaa, jolloin annetaan kiinteä arvo
                maaranpaa='Päätepysäkki / Ei reittitietoa';
            } else{
                maaranpaa=pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].headsign;
            }

            //ajoneuvoId=pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].trip.route.gtfsId; //Haetaan yksilöity ajoneuvoID, jos sille on tarvetta

            tietojenTulostus(pysakkiInfo.data.stop.name,pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].trip.route.shortName, maaranpaa, aikaLeima, pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].trip.route.gtfsId,pysakkiInfo.data.stop.zoneId); //Kutsutaan seuraavaa funktiota, jolle annetaan API:sta saatu pysäkin nimi, sekä muuttujat joille on aiemmin osoitettu arvo. Lisänä myös pysäkin ID
            //reittiTiedot(ajoneuvoId);
        }

    });
}

function tietojenTulostus(pysakinNimi, linjaNumero, maaranpaa, lahtoAika, reittiID,vyohyke) { //Tämä funktio tulostaa HTML-sivulle kartan alle halutut tiedot, eli pysäkin nimen, sen läpi kulkevat linjat ja niiden lähtöajan

    if (vyohyke==='D'){
        vyohykeKuva.src='media/vyohyke_D.png';
    } else if (vyohyke==='B'){
        vyohykeKuva.src='media/vyohyke_B.png';
    } else if (vyohyke==='C'){
        vyohykeKuva.src='media/vyohyke_C.png';
    } else {
        vyohykeKuva.src='media/vyohyke_A.png';
    }

    pysakki.innerHTML=pysakinNimi+'<br/>'+'<p>Seuraavat lähtevät</p>';
    lahto.innerHTML+=lahtoAika+'<br/>';
    linjaNRO.innerHTML+=`<a href="https://reittiopas.hsl.fi/linjat/${reittiID}" target="_blank">${linjaNumero}`;
    junareitti.innerHTML+=`<a href="https://reittiopas.hsl.fi/linjat/${reittiID}" target="_blank">${maaranpaa}</a>`
}

function bussiMarker(crd, teksti, pysakkiId) { //Tätä funktiota kutsutaan pysäkit-funktiotsta ja tämä asettaa kartalle oman markerin linja-autoille. Funktion click-toiminto tyhjentää edellisen pysäkkikohtaisen listauksen,

    L.marker([crd.latitude, crd.longitude], {icon: bussiIkoni}).addTo(map).bindPopup(teksti).on('click', function () { // kutsuu uutta listausta funktiolla kulkuneuvot ja muuttaa HTML-koodissa listauksen luokan näkyväksi
        clear();
        valifunktio(crd);
        kulkuneuvot(pysakkiId);
        if (polyline===null){
            reittiHaku.className='visible';
        }
        nakyva.className='visible';
        taulukko.className='hidden';
        pyoraTulostus.className='hidden';
    });
}

function sporaMarker(crd, teksti, pysakkiId) { //Funktio tulostaa raitiovaunuikonin kartalle, muuten sama toiminnallisuus kuin edellisessä

    L.marker([crd.latitude, crd.longitude], {icon: ratikkaIkoni}).addTo(map).bindPopup(teksti).on('click', function () {
        clear();
        valifunktio(crd);
        kulkuneuvot(pysakkiId);
        if (polyline===null){
            reittiHaku.className='visible';
        }
        nakyva.className='visible';
        taulukko.className='hidden';
        pyoraTulostus.className='hidden';
    });
}

function junaMarker(crd, teksti, pysakkiId) { //Tulostaa junaikonin, muuten sama kuin kaksi edellistä, mutta Helsingin rautatienaseman kohdalla haetaan aikataulutiedot toisesta rajapinnasta

    L.marker([crd.latitude, crd.longitude], {icon: junaIkoni}).addTo(map).bindPopup(teksti).on('click', function () {
        clear();
        valifunktio(crd);
        if (pysakkiId==='HSL:1020552'||pysakkiId==='HSL:1020502'||pysakkiId==='HSL:1020551'||pysakkiId==='HSL:1020501'||pysakkiId==='HSL:1020553'||pysakkiId==='HSL:1020503'){ //Määritetään tietyt junaikonit kutsumaan eri funktiota
            junaAikataulutulostus();
            if (polyline===null){
                reittiHaku.className='visible';
            }
            taulukko.className='visible';
            nakyva.className='hidden';
            pyoraTulostus.className='hidden';
        } else {
            if (polyline===null){
                reittiHaku.className='visible';
            }
            nakyva.className='visible';
            taulukko.className='hidden';
            pyoraTulostus.className='hidden';
            kulkuneuvot(pysakkiId);
        }
    });
}

function metroMarker(crd, teksti, pysakkiId) { //tulostaa metroikonin, muuten sama kuin kolme edellistä

    L.marker([crd.latitude, crd.longitude], {icon: metroIkoni}).addTo(map).bindPopup(teksti).on('click', function () {
        clear();
        valifunktio(crd);
        kulkuneuvot(pysakkiId);
        if (polyline===null){
            reittiHaku.className='visible';
        }
        nakyva.className='visible';
        taulukko.className='hidden';
        pyoraTulostus.className='hidden';
    });
}

function startTime() { //Funktio näytää reaaliaikasta kelloa pysäkkiaikataulujen yhteydessä
    const today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    let s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('pysakkitxt').innerHTML =
        h + ":" + m + ":" + s;
    document.getElementById('kellonaika').innerHTML =
        h + ":" + m + ":" + s;
    let t = setTimeout(startTime, 500);
}

function checkTime(i) { //Funktiolla määritetään oikea aikamuoto
    if (i < 10) {i = "0" + i}  // add zero in front of numbers < 10
    return i;
}

function liityntaPysakointi(crd, teksti, tila, kulkuneuvo, maksullisuus) { //Tulostetaan kartalle oikeat markerit pysäköintipaikoille, sekä tehdään toimintoja ettei toimimattomat paikat näy käyttäjälle
    const maksullinen = 'Pysäköinti on maksullista';
    const ilmainen12 = '12H maksuton pysäköinti';
    const ilmainen = 'Ilmainen pysäköinti 24H';

    if (tila==='INACTIVE'){

    } else {

        if (kulkuneuvo === 'BICYCLE') {

            if (maksullisuus === 'CUSTOM') {
                L.marker([crd.latitude, crd.longitude], {icon: pyoraParkkiIkoni}).addTo(map).bindPopup(teksti + '<br/>' + maksullinen).on('click', function () {
                    valifunktio(crd);
                    reittiOhjeistus.className='hidden';
                    if (polyline===null){
                        reittiHaku.className='visible';
                    }
                });
            } else if (maksullisuus === 'FREE_12H') {
                L.marker([crd.latitude, crd.longitude], {icon: pyoraParkkiIkoni}).addTo(map).bindPopup(teksti + '<br/>' + ilmainen12).on('click', function () {
                    valifunktio(crd);
                    reittiOhjeistus.className='hidden';
                    if (polyline===null){
                        reittiHaku.className='visible';
                    }
                });
            } else {
                L.marker([crd.latitude, crd.longitude], {icon: pyoraParkkiIkoni}).addTo(map).bindPopup(teksti + '<br>' + ilmainen).on('click', function () {
                    valifunktio(crd);
                    reittiOhjeistus.className='hidden';
                    if (polyline===null){
                        reittiHaku.className='visible';
                    }
                });
            }
        } else {
            if (maksullisuus === 'CUSTOM') {
                L.marker([crd.latitude, crd.longitude], {icon: parkkiIkoni}).addTo(map).bindPopup(teksti + '<br/>' + maksullinen).on('click', function () {
                    valifunktio(crd);
                    reittiOhjeistus.className='hidden';
                    if (polyline===null){
                        reittiHaku.className='visible';
                    }
                });
            } else if (maksullisuus === 'FREE_12H'){
                L.marker([crd.latitude, crd.longitude], {icon: parkkiIkoni}).addTo(map).bindPopup(teksti + '<br/>' + ilmainen12).on('click', function () {
                    valifunktio(crd);
                    reittiOhjeistus.className='hidden';
                    if (polyline===null){
                        reittiHaku.className='visible';
                    }
                });
            } else {
                L.marker([crd.latitude, crd.longitude], {icon: parkkiIkoni}).addTo(map).bindPopup(teksti + '<br>' + ilmainen).on('click', function () {
                    valifunktio(crd);
                    reittiOhjeistus.className='hidden';
                    if (polyline===null){
                        reittiHaku.className='visible';
                    }
                });
            }

        }
    }
}

function pysakointiPaikat(crd) { //Haetaan API:sta liityntäpysäköintipaikat ja niitä koskevat tarpeelliset tieodt, kuten sijainti, minkä pysköintiin ja onko ilmainen paikka. Paikat haetaan oman sijainnin mukaan, 2000m säteellä
    fetch(`https://p.hsl.fi/api/v1/facilities?geometry=POLYGON((${crd.longitude}+${crd.latitude},${crd.longitude}+${crd.latitude},${crd.longitude}+${crd.latitude},${crd.longitude}+${crd.latitude}))&maxDistance=2000`).then(function (vastaus) {
        return vastaus.json();
    }).then(function (hakutulokset) {
        //console.log(hakutulokset);
        for (let y=0;y<hakutulokset.results.length; y++){

            const tila = hakutulokset.results[y].status;
            const kulkuneuvo = hakutulokset.results[y].type;
            const maksullisuus = hakutulokset.results[y].pricingMethod;
            const koordinaatit = {
                latitude: hakutulokset.results[y].location.bbox[1],
                longitude: hakutulokset.results[y].location.bbox[0]
            };
            const teksti = hakutulokset.results[y].name.fi + '<br/>'+hakutulokset.results[y].name.sv;
            liityntaPysakointi(koordinaatit, teksti, tila, kulkuneuvo, maksullisuus, crd);
        }

    }).catch(function (error) {
        console.log(error);
    });
}

function junaTiedot1 () { //Funktiolla haetaan pysäkkikohtaisia tietoja, mutta spesifillä Helsingin rautatieaseman pysäkillä, idea on saada määränpäätieto oikealle junatunnukselle tämän API:n kautta
    const  junaTiedot1 = {
        query: `{
  stop(id: "HSL:1020501") {
    name
    zoneId
      stoptimesWithoutPatterns {
      headsign
        trip {
            route {
            shortName
            }
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
        body: JSON.stringify(junaTiedot1),
    };
    fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', options).then(function (response) {
        return response.json()
    }).then(function (junaTiedot1) {
        let zoneID=null, asemaNimi=null;

        for (let y=0;y<junaTiedot1.data.stop.stoptimesWithoutPatterns.length;y++){ //Loopissa haetaan muuttujille oikea data sekä pusketaan kahteen listaan junatunnuksia ja määränpäitä
            zoneID=junaTiedot1.data.stop.zoneId;
            asemaNimi = junaTiedot1.data.stop.name;
            junatunnuslista.push(junaTiedot1.data.stop.stoptimesWithoutPatterns[y].headsign)
            maaranpaaLista.push(junaTiedot1.data.stop.stoptimesWithoutPatterns[y].trip.route.shortName);
        }
        junaTiedot2(zoneID,asemaNimi); //Kutsutaan seuraavaa funktiota, jolla haetaan lisää tietoja edellä oleviin taulukoihin ja annetaan lähtöparametrinä kaksi muuttujaa
    });
}

function junaTiedot2 (zoneID, asemaNimi) {//Funktiolla haetaan pysäkkikohtaisia tietoja, mutta spesifillä Helsingin rautatieaseman pysäkillä, idea on saada määränpäätieto oikealle junatunnukselle tämän API:n kautta
    const  junaTiedot2 = {
        query: `{
  stop(id: "HSL:1020502") {
    name
    zoneId
      stoptimesWithoutPatterns {
      headsign
        trip {
            route {
            shortName
            }
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
        body: JSON.stringify(junaTiedot2),
    };
    fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', options).then(function (response) {
        return response.json()
    }).then(function (junaTiedot2) {
        for (let y=0;y<junaTiedot2.data.stop.stoptimesWithoutPatterns.length;y++){ //Loopataan samoihin taulukoihin lisää dataa, junatunnus sekä määränpää
            junatunnuslista.push(junaTiedot2.data.stop.stoptimesWithoutPatterns[y].headsign);
            maaranpaaLista.push(junaTiedot2.data.stop.stoptimesWithoutPatterns[y].trip.route.shortName);
        }
        junaTiedot3(zoneID,asemaNimi); //kutsutaan kolmatta samanlaista funktiota ja lähetetään edellisen funktion tiedot yhä eteenpäin
    });
}

function junaTiedot3 (zoneID, asemaNimi) {//Funktiolla haetaan pysäkkikohtaisia tietoja, mutta spesifillä Helsignin rautatieaseman pysäkillä, idea on saada määränpäätieto oikealle junatunnukselle tämän API:n kautta
    const  junaTiedot3 = {
        query: `{
  stop(id: "HSL:1020503") {
    name
    zoneId
      stoptimesWithoutPatterns {
      headsign
        trip {
            route {
            shortName
            }
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
        body: JSON.stringify(junaTiedot3),
    };

    fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', options).then(function (response) {
        return response.json()
    }).then(function (junaTiedot3) {
        let junaTietolista = [];
        for (let y=0;y<junaTiedot3.data.stop.stoptimesWithoutPatterns.length;y++){ //Loopataan kolmannen kerran samoihin taulukoihin dataa, viimeisen kerran.
            junatunnuslista.push(junaTiedot3.data.stop.stoptimesWithoutPatterns[y].headsign)
            maaranpaaLista.push(junaTiedot3.data.stop.stoptimesWithoutPatterns[y].trip.route.shortName);
        }
        for(let a=0;a<junatunnuslista.length;a++){ //edelliset kaksi taulukkoa työnnetään kolmanteen taulukkoon ja koostetaan niistä yksittäiset kokonaisuudet
            junaTietolista.push({heading:maaranpaaLista[a], trainID:junatunnuslista[a]});
        }
        junaAsematiedot(zoneID,asemaNimi, junaTietolista);//kutsutaan seuraavaa funktiota joka hakee eri rajapinnasta asematiedot, sekä lähetetään sille ensimmäiseltä junatiedot-funktiolta saadut tiedot ja tästä funktiosta luotu taulukko.
    });
}

function junaAsematiedot(zoneID,asemaNimi, junaTietoLista) {//Funktiolla haetaan digitraficin rajapinnasta asematieto käyttäen digitransit rajapinnan tietoja hyväksi.
    fetch(`https://rata.digitraffic.fi/api/v1/metadata/stations`).then(function (vastaus) {
        return vastaus.json();
    }).then(function (junaAsematiedot) {
        let asemaTunnus =null;

        if (asemaNimi==='Helsinki'){ //Määritetään digitransit-rajapinnasta saatu arvo digitrafic-rajapinnan kanssa samaa tarkoittavaksi
            asemaNimi='Helsinki asema'
        } else if (asemaNimi==='Pasila'){
            asemaNimi='Pasila asema'
        } else if (asemaNimi ==='Tikkurila'){
            asemaNimi='Tikkurila asema'
        }
        for (let i=0;i<junaAsematiedot.length;i++){ //Iteroidaan uusi rajapinta
            if (junaAsematiedot[i].stationName===asemaNimi){ //Vertailuoperaattorilla katsotaan oikea asematunnus, että saadaan oikean aseman aikataulu tulostettua.
                console.log(junaAsematiedot[i].stationName);
                console.log(junaAsematiedot[i].stationUICCode);
                asemaTunnus=junaAsematiedot[i].stationUICCode;
            }
        }
        trainSchedule(zoneID,asemaTunnus, junaTietoLista); //kutsutaan seuraavaa funktiota ja annetaan uusi muuttuja asematieodon kanssa, sekä myös aiemmasta funktisota saatu lista
    }).catch(function (error) {
        console.log(error);
    });
}

function trainSchedule(zoneID, asemaTunnus, junaTietolista) {//Funktiolla haetaan digitrafficin-rajapinnasta lähijunien aikatauluja ennalta määrätyillä parametreillä, lähtevät junat seuraavan 60min aikana
    fetch(`https://rata.digitraffic.fi/api/v1//live-trains/station/HKI?minutes_before_departure=60&minutes_after_departure=0&minutes_before_arrival=0&minutes_after_arrival=0&train_categories=Commuter`).then(function (vastaus) {
        return vastaus.json();
    }).then(function (trainSchedule) {
        //console.log(trainSchedule);
        //console.log(junaTietolista);
        for (let i=0;i<trainSchedule.length;i++){
            for (let u=0;u<trainSchedule[i].timeTableRows.length;u++) { //Iteroidaan API:sta saatu tieto
                if (trainSchedule[i].timeTableRows[u].stationUICCode===asemaTunnus&&trainSchedule[i].timeTableRows[u].type==='DEPARTURE') {//Vertailuoperaattoreilla haetaan tietyn aseman lähtevät junat
                    junaAikatauluKoostus(junaTietolista, trainSchedule[i].timeTableRows[u].scheduledTime, trainSchedule[i].commuterLineID, trainSchedule[i].timeTableRows[0].commercialTrack); //Kutsutaan tiettyjen ehtojen täyttessä seuraavaa funktiota minne lähetetään raaka data juuri iteroidusta rajapinnasta
                }
            }
        }
    }).catch(function (error) {
        console.log(error);
    });
}

function junaAikatauluKoostus(junaTietolista, lahtoaika, linjaID, raide) {//Funktiolla koostetaan kahden eri rajapinnan tiedot yhdeksi aikataululistaksi
    let dateStr = null, maaranpaa = null, paivamaara = null;
    dateStr = lahtoaika;
    paivamaara = new Date(dateStr); //Luodaan rajapinnasta saadusta lähtöajasta normaali kellonaika

    for (let a=0;a<junaTietolista.length;a++) {//iteroidaan aiemmin luotu määrnpäälista toisesta rajapinnasta saadun vertailuoperaattorin avulla ja annetaan oikealle junatunnukselle oikea määränpää
        if (linjaID === junaTietolista[a].heading) {
            maaranpaa = junaTietolista [a].trainID;
        }
    }
    const listaData=paivamaara.toTimeString().slice(0, 5); //määritetään muuttujalle oikea kellonaika ja muokataan se lopulliseen muotoon.
    lista.push({departureTime:listaData, directionId:linjaID, heading:maaranpaa,track:raide}); //Laitetaan lista-muuttujaan kahdesta rajapinnasta haetut yhdistetyt juna-aikataulut
}

function junaAikataulutulostus() { //Funktiolla tulostetaan kartan alapuolelle juna-aikataululista joka on haettu kahdesta rajapinnasta ja koostettu yhdeksi kokonaisuudeksi
    function dynamicSort(property) { //Tämä funktio lajittelee aiemmin luodun listan oikeaan kellonaikajärjestykseen
        let sortOrder = 1;

        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a,b) {
            if(sortOrder === -1){
                return b[property].localeCompare(a[property]);
            }else{
                return a[property].localeCompare(b[property]);
            }
        }
    }
    lista.sort(dynamicSort("departureTime"));
    //console.log(lista);
    taulukko.className='visible';
    for (let a=0;a<lista.length;a++){ //Tässä iteroidaan yhdistety lista näkyväksi aikatauluksi
        //console.log('Lähtöaika: '+lista[a].departureTime+' '+'Juna: '+lista[a].directionId+' '+'Määränpää: '+lista[a].heading+' '+'Raide: '+lista[a].track);
        aika.innerHTML+=lista[a].departureTime+'<br/>';
        juna.innerHTML+=lista[a].directionId+'<br/>';
        suunta.innerHTML+=lista[a].heading+'<br/>';
        raide.innerHTML+=lista[a].track+'<br/>';

    }
}


/**
 * @author Timo Tamminiemi
 */

const pyoraIkoni = L.icon({
    iconUrl: 'media/Bikeicon.png',
    iconSize: [40,40],
    iconAnchor: [10,30],
    popupAnchor: [10,-30]
});

//funktio tekee kyselyn digitransitin apiin ja palauttaa sieltä pks:n kaupunkipyörä asemien tiedot
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
    }).then(function(bikeInfo){
        console.log(bikeInfo)
        for(let i = 0; i<bikeInfo.data.bikeRentalStations.length; i++) {
            const sijainti = {
                latitude: bikeInfo.data.bikeRentalStations[i].lat,
                longitude: bikeInfo.data.bikeRentalStations[i].lon,
            };

            const teksti = `
        <h3>${bikeInfo.data.bikeRentalStations[i].name}</h3>
        <p>Aseman ID:${bikeInfo.data.bikeRentalStations[i].stationId}</p>
        <p>Vapaita pyöriä:${bikeInfo.data.bikeRentalStations[i].bikesAvailable}</p>
        <p>Vapaita paikkoja:${bikeInfo.data.bikeRentalStations[i].spacesAvailable}</p>
        <p>Tilaa palauttaa:${bikeInfo.data.bikeRentalStations[i].allowDropoff}</p>
        `;
            console.log(sijainti);
            pyoraMarker(sijainti, teksti, bikeInfo.data.bikeRentalStations[i]);
        }
    }).
    catch(function(error) {
        console.log(error);
    })
}

function pyoraMarker(crd, teksti, info) {

    L.marker([crd.latitude, crd.longitude], {icon: pyoraIkoni}).
    addTo(map).
    bindPopup(teksti).
    on('click', function () {
        clear();
        valifunktio(crd);
        if (polyline===null){
            reittiHaku.className='visible';
        }
        pyoraTulostus.className='visible';
        taulukko.className='hidden';
        nakyva.className='hidden';
        nimi.innerHTML = info.name;
        stationid.innerHTML = 'Aseman ID: ' + info.stationId;
        bikes.innerHTML = 'Vapaita pyöriä: ' + info.bikesAvailable;
        spaces.innerHTML = 'Vapaita paikkoja: ' + info.spacesAvailable;
        allow.innerHTML = 'Tilaa palauttaa: ' + info.allowDropoff;

    });
}
//funktio hakee reitti ohjeet kävellen
function reittiKavellen(paikka, crd) {
    reittiOhjeistus.className='visible';
    fetch(`https://graphhopper.com/api/1/route?point=${paikka.latitude},${paikka.longitude}&point=${crd.latitude},${crd.longitude}&vehicle=foot&locale=fi&calc_points=true&points_encoded=false&key=212b25b6-ac73-4540-89bf-61b6cf489997`).
    then(function(vastaus) {
        return vastaus.json();
    }).
    then(function(info) {
        console.log(info);
        for (let i=0;i<info.paths.length; i++){
            for (let y=0;y<info.paths[i].points.coordinates.length;y++){
                latlngs.push([info.paths[i].points.coordinates[y][1], info.paths[i].points.coordinates[y][0]]);
            }
            //for looppi joka tulostaa reitin tiedot sivulle
            for (let j = 0; j < info.paths[0].instructions.length; j++) {
                ohjeet.innerHTML += (j + 1) + '. ' + info.paths[0].instructions[j].text + ' ' + Math.round(info.paths[0].instructions[j].distance) + 'm' + "<br/>";
                console.log(info.paths[0].instructions[j].text);
            }
        }
        reitti(latlngs);
        matka.innerHTML = 'Reitin pituus on ' + ((Math.round(info.paths[0].distance) / 1000).toFixed(2)) + ' Km' + "<br/>";
    }).
    catch(function(error) {
        console.log(error);
    })
    console.log(latlngs);
}
//funktio hakee reitti ohjeet pyörällä
function reittiPyoralla(paikka, crd) {
    reittiOhjeistus.className='visible';
    fetch(`https://graphhopper.com/api/1/route?point=${paikka.latitude},${paikka.longitude}&point=${crd.latitude},${crd.longitude}&vehicle=bike&locale=fi&calc_points=true&points_encoded=false&key=212b25b6-ac73-4540-89bf-61b6cf489997`).
    then(function(vastaus) {
        return vastaus.json();
    }).
    then(function(info) {
        console.log(info);
        for (let i=0;i<info.paths.length; i++){
            for (let y=0;y<info.paths[i].points.coordinates.length;y++){
                latlngs.push([info.paths[i].points.coordinates[y][1], info.paths[i].points.coordinates[y][0]]);
            }
            //for looppi joka tulostaa reitin tiedot sivulle
            for (let j = 0; j < info.paths[0].instructions.length; j++) {
                ohjeet.innerHTML += (j + 1) + '. ' + info.paths[0].instructions[j].text + ' ' + Math.round(info.paths[0].instructions[j].distance) + 'm' + "<br/>";
                console.log(info.paths[0].instructions[j].text);
            }
        }
        reitti(latlngs);
        matka.innerHTML = 'Reitin pituus on ' + ((Math.round(info.paths[0].distance) / 1000).toFixed(2)) + ' Km' + "<br/>";
    }).
    catch(function(error) {
        console.log(error);
    })
    console.log(latlngs);
}
//funktio hakee reittiohjeet autolla
function reittiAutolla(paikka, crd) {
    reittiOhjeistus.className='visible';
    fetch(`https://graphhopper.com/api/1/route?point=${paikka.latitude},${paikka.longitude}&point=${crd.latitude},${crd.longitude}&vehicle=car&locale=fi&calc_points=true&points_encoded=false&key=212b25b6-ac73-4540-89bf-61b6cf489997`).
    then(function(vastaus) {
        return vastaus.json();
    }).
    then(function(info) {
        console.log(info);
        for (let i=0;i<info.paths.length; i++){
            for (let y=0;y<info.paths[i].points.coordinates.length;y++){
                latlngs.push([info.paths[i].points.coordinates[y][1], info.paths[i].points.coordinates[y][0]]);
            }
            //for looppi joka tulostaa reitin tiedot sivulle
            for (let j = 0; j < info.paths[0].instructions.length; j++) {
                ohjeet.innerHTML += (j + 1) + '. ' + info.paths[0].instructions[j].text + ' ' + Math.round(info.paths[0].instructions[j].distance) + 'm' + "<br/>";
                console.log(info.paths[0].instructions[j].text);
            }
        }
        reitti(latlngs);
        matka.innerHTML = 'Reitin pituus on ' + ((Math.round(info.paths[0].distance) / 1000).toFixed(2)) + ' Km' + "<br/>";
    }).
    catch(function(error) {
        console.log(error);
    })
    console.log(latlngs);
}
//funktio piirtää reitin kartalle taulukosta otettujen koordinaattien perusteella
function reitti(latlngs) {
    reittiHaku.className='hidden';
    console.log(latlngs);
    polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
    map.fitBounds(polyline.getBounds());
}

//mene pitää korvata jollain yllä olevalla funktiolla
function valifunktio(crd) {
    haeReitti.addEventListener('click', napinpainallus);
    function napinpainallus() {
        if (document.getElementById('radio1')) {
            reittiKavellen(paikka, crd);
        } else if (document.getElementById('radio2')){
            reittiPyoralla(paikka, crd);
        } else if (document.getElementById('radio3')){
            reittiAutolla(paikka, crd);
        } else {
                alert('Valitse jokin kulkumuotovaihtoehto');
        }
    }
}
//valifunktio kutsutaan lisaamarkerista