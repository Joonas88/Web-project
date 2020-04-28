'use strict';
/**
 * @author Joonas Soininen
 */
const pysakki = document.getElementById('pysakkiNimi');
const lahto = document.getElementById('pysakkidata');
const linjaNRO = document.getElementById('pysakkidata2');
const reitti = document.getElementById('pysakkidata3');
const nakyva = document.getElementById('piilotus');

const hakunappi = document.getElementById('hakunappi');

const pysakkiCheck = document.getElementById('pysakit');
pysakkiCheck.checked=true;

let ajoneuvoId = null;
let paikka = null;

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

const map = L.map('map'); //Luodaan kartalle muuttuja ja määritetään sille lähde karttapohjan hakuun
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const options = { //Kartan asetuksia joilla määritetään sijainnin tarkuuden tarkkuus
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

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

function napinpano() { //Funktiolla määritellään mitä tapathuu hakunappia painettaessa

    if (pysakkiCheck.checked===true){
        pysakit(paikka);
        clear();
    } else {
        lahto.innerHTML='Et valinnut mitään vaihtoehtoa';
        location.reload(paikka);
    }

}

//Helsingin rautatieasmean koordinaatit: lat:60.171040,lon: 24.941957
// kartan toiminnallisuuden testaamista varten

function pysakit (crd) { //Funktiolla haetaan API:sta dataa, tässä tapauksessa pysäkkien sijaintitietoja
    const pysakkiKysely = { //Annetaan hakuun parametrit, mitä tietoja rajapinnasta haetaan, käytetään omaa sijaintia sekä 500m sädettä tuloksien rajaamiseen
        query: `{
    stopsByRadius(lat:${crd.latitude},lon: ${crd.longitude} ,radius:1000) { 
      edges {
        node {
          stop { 
            gtfsId 
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
    }).then(function (tulos) { //Tässä on haettu data tulos-muuttujan muodossa

        console.log(tulos);
        for (let x = 0; x < tulos.data.stopsByRadius.edges.length; x++) { //Rajapinnan tulos iteroidaan sieltä löytyvän Arrayn pituuden mukaan ja annetaan muuttujille halutut arvot

            //console.log(tulos.data.stopsByRadius.edges[x].node.stop.gtfsId+' '+tulos.data.stopsByRadius.edges[x].node.stop.name+' '+tulos.data.stopsByRadius.edges[x].node.distance+'m päässä');

            const koordinaatit = {latitude: tulos.data.stopsByRadius.edges[x].node.stop.lat, longitude: tulos.data.stopsByRadius.edges[x].node.stop.lon}; //Tässä tapauksessa koordinaatit ja toiselle pysäkin nimi ja etäisyys käyttäjästä

            const teksti=`<h4>${tulos.data.stopsByRadius.edges[x].node.stop.name+' '+tulos.data.stopsByRadius.edges[x].node.distance+'m päässä'}</h4>`;

            //console.log(tulos.data.stopsByRadius.edges[x].node.stop.vehicleMode);

            if (tulos.data.stopsByRadius.edges[x].node.stop.vehicleMode==='TRAM'){ //Tuloksista riippuen kutsutaan toista funktiota jole lähetetään saatuja arjova, sekä lisänä pysäkkien ID
                sporaMarker(koordinaatit, teksti, tulos.data.stopsByRadius.edges[x].node.stop.gtfsId);
            } else if (tulos.data.stopsByRadius.edges[x].node.stop.vehicleMode==='RAIL') {
                junaMarker(koordinaatit, teksti, tulos.data.stopsByRadius.edges[x].node.stop.gtfsId);
            } else if (tulos.data.stopsByRadius.edges[x].node.stop.vehicleMode==='SUBWAY'){
                metroMarker(koordinaatit, teksti, tulos.data.stopsByRadius.edges[x].node.stop.gtfsId);
            } else {
                bussiMarker(koordinaatit, teksti, tulos.data.stopsByRadius.edges[x].node.stop.gtfsId);
            }

        }
    });
}

function kulkuneuvot (pysakkiId) { //Funktiolla haetaan API:sta dataa, tässä tapauksessa edellä haettujen pysäkkien kautta kulkevia linjoja, käyttäen pysäkkiId parametriä joka on määritetty toisessa funktiossa
    //console.log(pysakkiId);
    const  kulkuneuvot = {
        query: `{
  stop(id: "${pysakkiId}") {
    name
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
    }).then(function (pysakkiInfo) { //API palauttaa listan linjoista jotka kulkeat halutun pysäkin läpi
        //console.log(pysakkiInfo);

        for (let x=0; x<pysakkiInfo.data.stop.stoptimesWithoutPatterns.length; x++){ //Iteroidaan API:sta saatu tieto

            const aikaLeima = new Date((pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].serviceDay+pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].realtimeDeparture)*1000).toLocaleTimeString("fi-FI"); //Muuttujalle määritellään API:sta saatu aikatieto ja muunnetaan se ihmisen luettavaan kellonaikaan
            //API palauttaa UNIX aikamuotoa, eli sekunteja pisteestä X, tässä tapauksessa keskiyöstä nykyhetkeen.
            /*
            console.log(pysakkiInfo.data.stop.name);
            console.log(pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].trip.route.gtfsId);
            console.log(pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].trip.route.shortName+' '+pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].headsign+' '+aikaLeima);

             */

            let maaranpaa = null;

            if (pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].headsign===null){ //Määränpää linjalla voi olla tietyissä tilantessa NULL, menossa varikolle tai lopettamassa linjaa, jolloin haetaan tilalle linjan reittitieto
                maaranpaa=pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].trip.route.longName;
            } else{
                maaranpaa=pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].headsign;
            }

            ajoneuvoId=pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].trip.route.gtfsId; //Haetaan yksilöity ajoneuvoID, jos sille on tarvetta

            tietojenTulostus(pysakkiInfo.data.stop.name,pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].trip.route.shortName, maaranpaa, aikaLeima, pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].trip.route.gtfsId); //Kutsutaan seuraavaa funktiota, jolle annetaan API:sta saatu pysäkin nimi, sekä muuttujat joille on aiemmin osoitettu arvo. Lisänä myös pysäkin ID
            //reittiTiedot(ajoneuvoId);
        }

    });
}

function tietojenTulostus(pysakinNimi, linjaNumero, maaranpaa, lahtoAika, reittiID) { //Tämä funktio tulostaa HTML-sivulle kartan alle halutut tiedot, eli pysäkin nimen, sen läpi kulkevat linjat ja niiden lähtöajan
    pysakki.innerHTML=pysakinNimi+'<br/>'+'<p>Seuraavat lähtevät</p>';
    lahto.innerHTML+=lahtoAika+'<br/>';
    linjaNRO.innerHTML+=`<a href="https://reittiopas.hsl.fi/linjat/${reittiID}" target="_blank">${linjaNumero}`;
    reitti.innerHTML+=`<a href="https://reittiopas.hsl.fi/linjat/${reittiID}" target="_blank">${maaranpaa}</a><br/><br/>`
}

function minaOlenTassa(crd, teksti) { //Tämä funktio tulostaa markerin kaartalle oman sijainnin kohdalle, Markerissa on klik, eli painotoiminto, jota ei tässä käytetä kuin popup kuplan nostoon
    L.marker([crd.latitude, crd.longitude]).addTo(map).bindPopup(teksti).openPopup().on('click', function () {

    });
}


function bussiMarker(crd, teksti, pysakkiId) { //Tätä funktiota kutsutaan pysäkit-funktiotsta ja tämä asettaa kartalle oman markerin linja-autoille. Funktion click-toiminto tyhjentää edellisen pysäkkikohtaisen listauksen,
    L.marker([crd.latitude, crd.longitude], {icon: bussiIkoni}).addTo(map).bindPopup(teksti).openPopup().on('click', function () { // kutsuu uutta listausta funktiolla kulkuneuvot ja muuttaa HTML-koodissa listauksen luokan näkyväksi
        clear();
        kulkuneuvot(pysakkiId);
        nakyva.className='visible';
        navigoi.href=`https://www.openstreetmap.org/directions?engine=graphhopper_foot&route=${paikka.latitude}%2C${paikka.longitude}%3B${crd.latitude}%2C${crd.longitude}`;
    });
}

function sporaMarker(crd, teksti, pysakkiId) { //Funktio tulostaa raitiovaunuikonin kartalle, muuten sama toiminnallisuus kuin edellisessä
    L.marker([crd.latitude, crd.longitude], {icon: ratikkaIkoni}).addTo(map).bindPopup(teksti).openPopup().on('click', function () {
        clear();
        kulkuneuvot(pysakkiId);
        nakyva.className='visible';
        navigoi.href=`https://www.openstreetmap.org/directions?engine=graphhopper_foot&route=${paikka.latitude}%2C${paikka.longitude}%3B${crd.latitude}%2C${crd.longitude}`;
    });
}

function junaMarker(crd, teksti, pysakkiId) { //Tulostaa junaikonin, muuten sama kuin kaksi edellistä
    L.marker([crd.latitude, crd.longitude], {icon: junaIkoni}).addTo(map).bindPopup(teksti).openPopup().on('click', function () {
        clear();
        kulkuneuvot(pysakkiId);
        nakyva.className='visible';
        navigoi.href=`https://www.openstreetmap.org/directions?engine=graphhopper_foot&route=${paikka.latitude}%2C${paikka.longitude}%3B${crd.latitude}%2C${crd.longitude}`;
    });
}

function metroMarker(crd, teksti, pysakkiId) { //tulostaa metroikonin, muuten sama kuin kolme edellistä
    L.marker([crd.latitude, crd.longitude], {icon: metroIkoni}).addTo(map).bindPopup(teksti).openPopup().on('click', function () {
        clear();
        kulkuneuvot(pysakkiId);
        nakyva.className='visible';
        navigoi.href=`https://www.openstreetmap.org/directions?engine=graphhopper_foot&route=${paikka.latitude}%2C${paikka.longitude}%3B${crd.latitude}%2C${crd.longitude}`;
    });
}

function clear() { //Funktio tyhjentää pysäkkitiedot ennen uudelleenkirjoitusta
    lahto.innerHTML='';
    linjaNRO.innerHTML='';
    reitti.innerHTML='';
}

function startTime() { //Funktio näytää reaaliaikasta kelloa pysäkkiaikataulujen yhteydessä
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('pysakkitxt').innerHTML =
        h + ":" + m + ":" + s;
    var t = setTimeout(startTime, 500);
}
function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
}
