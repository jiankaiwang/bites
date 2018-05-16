/** 
 * desc : get the current position
*/

/**
 * desc : global variable
 */
var selfLoc = [];
var selfLocRange = [];
var __dev_grid__data = [];

/**
 * desc : design markers
 */
var __selfIcon = L.AwesomeMarkers.icon({
	icon: 'user',
	prefix: 'fa',
	markerColor: 'blue'
});

/**
 * desc: get radius in meter
 */
function getRadius() {
	getAllParams();
	return paramEffect["settings"]["range"][allParams["settings"]["range"]-1];
}

// latlng: {lat: 25.043170699999997, lng: 121.5227317}
function drawRange(latlng) {
	while (selfLocRange.length > 0) {
		for (var i = 0 ; i < selfLocRange.length ; i++) {
			mymap.removeLayer(selfLocRange[i]);
			selfLocRange.splice(selfLocRange.indexOf(selfLocRange[i]), 1);
		}
	}
	selfLocRange.push(new L.circle(latlng, getRadius()).addTo(mymap));
}

function __dev_grid(latlng) {
	while (__dev_grid__data.length > 0) {
		for (var i = 0 ; i < __dev_grid__data.length ; i++) {
				mymap.removeLayer(__dev_grid__data[i]);
				__dev_grid__data.splice(__dev_grid__data.indexOf(__dev_grid__data[i]), 1);
		}
	}

	var allGrids = getGridList(latlng["lat"], latlng["lng"], getRadius());

	//console.log(allGrids);
	var __grid = {
		radius: 1,
		fillColor: "rgba(237,28,36,0.8)",
		color: "rgba(237,28,36,1)",
		weight: 2,
		opacity: 1,
		fillOpacity: 1
	};

	var tmpLoc = [];
	for(var i = 0 ; i < allGrids.length ; i++) {
		tmpLoc = allGrids[i].split('-');
		tmpLoc[0] = parseFloat(tmpLoc[0]);
		tmpLoc[1] = parseFloat(tmpLoc[1]);
		//allPoints.push({"lat":tmpLoc[0],"lng":tmpLoc[1]});
		__dev_grid__data.push(L.circleMarker({"lat":tmpLoc[0],"lng":tmpLoc[1]}, __grid).addTo(mymap));
	}
	//console.log(allPoints);
}

function __set_crt_latlng(latlng, selfIcon) {
	// remove first
	while (selfLoc.length > 0) {
		for (var i = 0 ; i < selfLoc.length ; i++) {
				mymap.removeLayer(selfLoc[i]);
				selfLoc.splice(selfLoc.indexOf(selfLoc[i]), 1);
		}
	}
	while (selfLocRange.length > 0) {
		for (var i = 0 ; i < selfLocRange.length ; i++) {
				mymap.removeLayer(selfLocRange[i]);
				selfLocRange.splice(selfLocRange.indexOf(selfLocRange[i]), 1);
		}
	}

	//setMapView(latlng, 12);
	setMapView(latlng);

	// add current location
	var addSelfMarker = new L.marker(latlng, {icon: selfIcon, draggable: true});
	addSelfMarker.on('dragend', function(e) {
		setTimeout(function() {
			//console.log(addSelfMarker._latlng);
			__set_crt_latlng(addSelfMarker._latlng, selfIcon);
		}, 100);
	});
	addSelfMarker.addTo(mymap);
	selfLoc.push(addSelfMarker);
	drawRange(latlng);

	// draw grids on map
	//__dev_grid(latlng);

	// reset the button from file "warnandcamera.js"
	retHospAndWarningBtn();

	// find risk snake position from "addSnake.js"
	addSnakeData();

	// find risk rabies position from "addRabies.js"
	addRabiesData();
}

/**
 * 
 */
function __retrieveInputAddress() {
	var address = $($('input#searchAddress')[1]).val();
	if(address.length < 2) { return ; }
	$.ajax({
		url: '/api/geocoding?addr=' + address,
		type: 'get',
		data: {},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log(xhr.status + " " + thrownError + ". Cannot connect to /api/geocoding.");
		},
		success: function (response) {
			if(response["status"] == "success") {
				__set_crt_latlng(response["response"], __selfIcon);
				mymap.setView(response["response"], 12);
			} else {
				console.log(response["response"]);
			}
		}
	});
}

function getGridList(lat, lng, zone) {
	function getGridIndex(value) {
		var grid = {0:"000",1:"250",2:"500",3:"750"};
		var oriVal = floatFixed5(parseFloat(value));
		var rawValue = oriVal.toString();
		var overunit = parseInt(rawValue.substring(rawValue.length - 3, rawValue.length));
		var index = Math.floor(overunit / 250.0);
		var combine = rawValue.substring(0, rawValue.length-3) + grid[index];
		return combine;
	}
	function floatFixed5(value) {
		return parseFloat(value).toFixed(5);
	}
	var adjustzone = parseInt(zone / 1000.0);
    var gridCount = parseFloat(zone) / 250.0;
    var meterunit = 250.0 / 100000.0;
    var startLat = parseFloat(getGridIndex(lat)) - meterunit * (gridCount+2*adjustzone) / 2.0;
    var startLng = parseFloat(getGridIndex(lng)) - meterunit * (gridCount+2*adjustzone) / 2.0;
    var ttlGridList = [];
    // +1 : includes current location
    var gridLat = startLat;
    var gridLng = startLng;
    for(var i = 0 ; i < gridCount*2 + 1 + 1 * (-1*adjustzone); i++) {
        gridLat = startLat + meterunit * i;
        for(var j = 0 ; j < gridCount*2 + 1 + 1 * (-1*adjustzone) ; j++) {
            gridLng = startLng + meterunit * j;
            ttlGridList.push(String(floatFixed5(gridLat)) + "-" + String(floatFixed5(gridLng)));
        }
        gridLng = startLng;
    }
    return ttlGridList;
}

/*
 * desc : show myself location
 */
function __showCurrentLocation() {
	// add the marker and circle
	function onLocationFound(e) {
		// label current circle marker
		var geojsonMarkerOptions = {
			radius: 6,
			fillColor: "rgba(0,0,255,0.8)",
			color: "rgba(0,0,0,1)",
			weight: 1,
			opacity: 1,
			fillOpacity: 0.8
		};
		
		__set_crt_latlng(e.latlng, __selfIcon);
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
            var control_htm = '<a id="selfposbtn" class="leaflet-control-zoom-in" href="#" title="'
				+ frontTranslation("selfLocBtn",defaultLang)
				+ '" role="button"  data-toggle="popover" data-container="body" data-placement="left" type="button" data-html="true" >'
				+ '<i class="fa fa-map-marker main-btn" aria-hidden="true"></i></a>';
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