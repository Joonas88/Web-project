'use strict';
//hakee reitti ohjeet rautatieasemalta pasilaan
mene();
function mene() {
    let latlngs=[];
    fetch(`https://graphhopper.com/api/1/route?point=60.198008,24.933722&point=60.171040,24.941957&vehicle=foot&locale=fi&calc_points=true&points_encoded=false&key=212b25b6-ac73-4540-89bf-61b6cf489997`).
    then(function(vastaus) {
        return vastaus.json();
    }).
    then(function(info) {
        console.log(info);
        for (let i=0;i<info.paths.length; i++){
            //console.log(info.paths[i].points.coordinates);
            for (let y=0;y<info.paths[i].points.coordinates.length;y++){
                //console.log(info.paths[i].points.coordinates[y][0]+', '+info.paths[i].points.coordinates[y][1]);
                latlngs.push(info.paths[i].points.coordinates[y][1]+', '+info.paths[i].points.coordinates[y][0]);
            }
        }
    }).
    catch(function(error) {
        console.log(error);
    })
    console.log(latlngs);
}