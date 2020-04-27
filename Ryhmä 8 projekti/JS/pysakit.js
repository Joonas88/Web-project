const pysakki = document.getElementById('nimi');
const ylaLista = document.getElementById('pysakkiInfo');
const lista = document.getElementById('data');
const pysakkiCheck = document.getElementById('pysakit');
pysakkiCheck.checked=true;
let ajoneuvoId = null;

const bussiIkoni = L.icon({
    iconUrl: 'media/Bussicon.png',
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
    minaOlenTassa(paikka,'Minä olen tässä!');
}
function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);

const hakunappi = document.getElementById('hakunappi');

hakunappi.addEventListener('click', napinpano);

console.log(pysakkiCheck.value);

function napinpano() {

    if (pysakkiCheck.checked===true){
        pysakit(paikka);
        clear();
    } else {
        lista.innerHTML='Et valinnut mitään vaihtoehtoa';
        location.reload(paikka);
    }

}

//Helsingin rautatieasmean koordinaatit: lat:60.171040,lon: 24.941957

function pysakit (crd) {
    const pysakkiKysely = {
        query: `{
    stopsByRadius(lat:${crd.latitude},lon: ${crd.longitude},radius:1000) {
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

    fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', options).then(function (response) {
        return response.json()
    }).then(function (tulos) {
        console.log(tulos);
        for (let x = 0; x < tulos.data.stopsByRadius.edges.length; x++) {
            console.log(tulos.data.stopsByRadius.edges[x].node.stop.gtfsId+' '+tulos.data.stopsByRadius.edges[x].node.stop.name+' '+tulos.data.stopsByRadius.edges[x].node.distance+'m päässä');

            const koordinaatit = {latitude: tulos.data.stopsByRadius.edges[x].node.stop.lat, longitude: tulos.data.stopsByRadius.edges[x].node.stop.lon};

            const teksti=`<h4>${tulos.data.stopsByRadius.edges[x].node.stop.name+' '+tulos.data.stopsByRadius.edges[x].node.distance+'m päässä'}</h4>`;

            console.log(tulos.data.stopsByRadius.edges[x].node.stop.vehicleMode);

            if (tulos.data.stopsByRadius.edges[x].node.stop.vehicleMode==='TRAM'){
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

function kulkuneuvot (pysakkiId) {
    console.log(pysakkiId);
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
    }).then(function (pysakkiInfo) {
        console.log(pysakkiInfo);

        for (let x=0; x<pysakkiInfo.data.stop.stoptimesWithoutPatterns.length; x++){

            const aikaLeima = new Date((pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].serviceDay+pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].realtimeDeparture)*1000).toLocaleTimeString("fi-FI");

            console.log(pysakkiInfo.data.stop.name);
            console.log(pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].trip.route.gtfsId);
            console.log(pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].trip.route.shortName+' '+pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].headsign+' '+aikaLeima);

            let maaranpaa = null;

            if (pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].headsign===null){
                maaranpaa=pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].trip.route.longName;
            } else{
                maaranpaa=pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].headsign;
            }

            ajoneuvoId=pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].trip.route.gtfsId;

            tietojenTulostus(pysakkiInfo.data.stop.name,pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].trip.route.shortName, maaranpaa, aikaLeima, pysakkiInfo.data.stop.stoptimesWithoutPatterns[x].trip.route.gtfsId);
            reittiTiedot(ajoneuvoId);
        }

    });
}

function tietojenTulostus(pysakinNimi, linjaNumero, maaranpaa, lahtoAika, reittiID) {
    pysakki.innerHTML=pysakinNimi;
    lista.innerHTML+=lahtoAika+'<br/>'+`<a href="https://reittiopas.hsl.fi/linjat/${reittiID}" target="_blank">${linjaNumero} ${maaranpaa}</a><br/><br/>`;
}

function minaOlenTassa(crd, teksti) {
    L.marker([crd.latitude, crd.longitude]).addTo(map).bindPopup(teksti).openPopup().on('click', function () {

    });
}

function bussiMarker(crd, teksti, pysakkiId) {
    L.marker([crd.latitude, crd.longitude], {icon: bussiIkoni}).addTo(map).bindPopup(teksti).openPopup().on('click', function () {
        clear();
        kulkuneuvot(pysakkiId)
    });
}

function sporaMarker(crd, teksti, pysakkiId) {
    L.marker([crd.latitude, crd.longitude], {icon: ratikkaIkoni}).addTo(map).bindPopup(teksti).openPopup().on('click', function () {
        clear();
        kulkuneuvot(pysakkiId)
    });
}

function junaMarker(crd, teksti, pysakkiId) {
    L.marker([crd.latitude, crd.longitude], {icon: junaIkoni}).addTo(map).bindPopup(teksti).openPopup().on('click', function () {
        clear();
        kulkuneuvot(pysakkiId)
    });
}

function metroMarker(crd, teksti, pysakkiId) {
    L.marker([crd.latitude, crd.longitude], {icon: metroIkoni}).addTo(map).bindPopup(teksti).openPopup().on('click', function () {
        clear();
        kulkuneuvot(pysakkiId)
    });
}

function clear() {
    lista.innerHTML='';
}