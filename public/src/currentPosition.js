/** 
 * desc : get the current position
*/

/**
 * desc : global variable
 */
var selfLoc = [];

/**
 * desc : design markers
 */
var __selfIcon = L.AwesomeMarkers.icon({
	icon: 'user',
	prefix: 'fa',
	markerColor: 'blue'
});

/*
 * desc : show myself location
 */
function __showCurrentLocation() {
	// add the marker and circle
	function onLocationFound(e) {

		// remove first
		while (selfLoc.length > 0) {
			for (var i = 0 ; i < selfLoc.length ; i++) {
					mymap.removeLayer(selfLoc[i]);
					selfLoc.splice(selfLoc.indexOf(selfLoc[i]), 1);
			}
		}

		// label current circle marker
		var geojsonMarkerOptions = {
			radius: 6,
			fillColor: "rgba(0,0,255,0.8)",
			color: "rgba(0,0,0,1)",
			weight: 1,
			opacity: 1,
			fillOpacity: 0.8
		};
		
		// add current location
		//selfLoc.push(new L.circleMarker(e.latlng, geojsonMarkerOptions).addTo(mymap));
		selfLoc.push(new L.circle(e.latlng, 500).addTo(mymap));
		selfLoc.push(new L.marker(e.latlng, {icon: __selfIcon}).addTo(mymap));

		// reset the button from file "warnandcamera.js"
		retHospAndWarningBtn();

		// find risk rabies position from "addRabies.js"
		addRabiesInOneYear();
	}

	function onLocationError(e) {
		console.log(e.message);
	}

	mymap.on('locationfound', onLocationFound);
	mymap.on('locationerror', onLocationError);
	mymap.locate({ setView: true, maxZoom: 12 });
}

/**
 * para@previous : previous parameters
 * para@callback : callback function
 */
function addSelfLocBtnToMap(previous,callback) {
    try{
        // current location
        var crtPosLoc = L.control({ position: 'bottomright' });
        crtPosLoc.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'leaflet-control-zoom leaflet-bar leaflet-control');
            div.style.backgroundColor = 'white';
            var control_htm = '<a id="selfposbtn" class="leaflet-control-zoom-in" href="#map" title="'
				+ frontTranslation("selfLocBtn",defaultLang)
                + '" role="button" onclick="__showCurrentLocation();"><i class="fa fa-map-marker main-btn" aria-hidden="true"></i></a>';
            div.innerHTML = control_htm;
            div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
            L.DomEvent.disableClickPropagation(div);
            return div;
        };
		crtPosLoc.addTo(mymap);

        callback(null, "");
    } catch(err) {
        callback(err);
    }
}