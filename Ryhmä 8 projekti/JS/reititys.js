'use strict';
//hakee reitti ohjeet rautatieasemalta pasilaan
mene();
function mene() {
    fetch(`https://graphhopper.com/api/1/route?point=60.198008,24.933722&point=60.171040,24.941957&vehicle=foot&locale=fi&calc_points=true&key=212b25b6-ac73-4540-89bf-61b6cf489997`).
    then(function(vastaus) {
        return vastaus.json();
    }).
    then(function(info) {
        console.log(info);
    }).
    catch(function(error) {
        console.log(error);
    })
}