'use strict';


const hakunappi = document.getElementById('hakunappi');

hakunappi.addEventListener('click', etsi);

function etsi() {
    const hakuteksti = document.getElementById('hakukenttä').value;
    console.log(hakuteksti);
    fetch(`https://services1.arcgis.com/sswNXkUiRoWtrx0t/arcgis/rest/services/HSL_pysakit_kevat2018/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json`).then(function (vastaus) {
        return vastaus.json();
    }).then(function (hakutulokset) {
        console.log(hakutulokset.features);
        console.log(hakutulokset.features[0].attributes);

        const pysakit= document.querySelector('tulos');

        for (let x=0; x<hakutulokset.features.length; x++) {

            if (hakutulokset.features[x].attributes.NIMI1.includes(hakuteksti)){
                pysakit.innerHTML += 'Löytyy listalta! <br/>';
            } else
                pysakit.innerHTML += 'Ei löydy :(<br/>';

            //pysakit.innerHTML += hakutulokset.features[x].attributes.LYHYTTUNNU+' '+hakutulokset.features[x].attributes.NIMI1+' '+hakutulokset.features[x].attributes.NAMN1+'<br/>';
            //document.write(hakutulokset.features[x].attributes.LYHYTTUNNU+' '+hakutulokset.features[x].attributes.NIMI1+' '+hakutulokset.features[x].attributes.NAMN1+'<br/>');

        }

    }).catch(function (error) {
        console.log(error);
    });
}