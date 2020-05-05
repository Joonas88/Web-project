'use strict';
const ohjeet = document.getElementById('ohjeet');
const matka = document.getElementById('matka');
let latlngs = [];
//funktio hakee reittiohjeet rautatieasemalta pasilaan
reittiKavellen();
function reittiKavellen(paikka, crd) {
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
                ohjeet.innerHTML += info.paths[0].instructions[j].text + "<br/><br/>";
                console.log(info.paths[0].instructions[j].text);
            }
        }
        reitti(latlngs);
        matka.innerHTML = 'Reitin pituus on ' + ((Math.round(info.paths[0].distance) / 1000).toFixed(2)) + ' Km' +"<br/>";
    }).
    catch(function(error) {
        console.log(error);
    })
    console.log(latlngs);
}
reittiPyoralla();
function reittiPyoralla(paikka, crd) {
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
                ohjeet.innerHTML += info.paths[0].instructions[j].text + "<br/><br/>";
                console.log(info.paths[0].instructions[j].text);
            }
        }
        reitti(latlngs);
        matka.innerHTML = 'Reitin pituus on ' + ((Math.round(info.paths[0].distance) / 1000).toFixed(2)) + ' Km' +"<br/>";
    }).
    catch(function(error) {
        console.log(error);
    })
    console.log(latlngs);
}
reittiAutolla();
function reittiAutolla(paikka, crd) {
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
                ohjeet.innerHTML += info.paths[0].instructions[j].text + "<br/><br/>";
                console.log(info.paths[0].instructions[j].text);
            }
        }
        reitti(latlngs);
        matka.innerHTML = 'Reitin pituus on ' + ((Math.round(info.paths[0].distance) / 1000).toFixed(2)) + ' Km' +"<br/>";
    }).
    catch(function(error) {
        console.log(error);
    })
    console.log(latlngs);
}
//funktio piirtää reitin kartalle taulukosta otettujen koordinaattien perusteella
function reitti(latlngs) {
    console.log(latlngs);
    let polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
    map.fitBounds(polyline.getBounds());
}

//mene pitää korvata jollain yllä olevalla funktiolla
function valifunktio(crd) {
    haeReitti.addEventListener('click', napinpainallus);
    function napinpainallus() {
        console.log(crd);
        mene(paikka, crd);
    }
}
//valifunktio kutsutaan lisaamarkerista