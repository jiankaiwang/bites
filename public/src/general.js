/*
 * global settings
 * |- mymap : base map object
 */
var mymap;

/*
 * desc : api checker
 */
function apiChecker(callback) {
	$.ajax({
		url: '/api',
		type: 'get',
		data: {},
		error: function (xhr, ajaxOptions, thrownError) {
			callback(xhr.status + " " + thrownError + ". Cannot connect to /api.");
		},
		success: function (response) {
			if(defaultLang.length < 1) {
				// get the default language only when no other language assigning
				defaultLang = response["defaultLang"];
			}
			callback(null, "");
		}
	});
}

/*
 * desc : initial base map
 */
function initialMap(previousInfo, callback) {
	try {
		// basic setting, setView and personal information
		mymap = L.map('mapid',{
			center: crtLoc,
			zoomControl: false,
			zoom: zoomLevel,
			layers: allBaseLayers[0]
		});
		
		// catch map basemap changing into greyscale event
		mymap.on('baselayerchange', function (e) {
			if (e.name == layerTypeName["osm"]["grey"][defaultLang] && (!$('#mapid').hasClass('grayscale'))) {
				$('#mapid').addClass('grayscale');
			} else if (e.name != layerTypeName["osm"]["grey"][defaultLang] && $('#mapid').hasClass('grayscale')) {
				$('#mapid').removeClass('grayscale');
			}
		});

		//add zoom control with your options
		L.control.zoom({
			position:'bottomright'
		}).addTo(mymap);

		// success callback
		callback(null, "");
	} catch(err) {
		callback("Can not initialize the map. " + err);
	}
}

/**
 * desc: prepare the properities
 */
function prepareProperity(data) {
	var key = getDictionaryKeyList(data);
	var text = "<h5>";
	for(var i = 0 ; i < key.length ; i++) {
		text += key[i] + ": " + data[key[i]] + "<br>";
	}
	text += "</h5>";
	return text;
}

/**
 * desc: add points on the map
 */
function addPointService() {
	function onEachFeature(feature, layer) {
		// does this feature have a property named popupContent?
		if (feature.properties) {
			layer.bindPopup(prepareProperity(feature.properties));
		}
	}

	var states = [];

	var geojsonMarkerOptions = {
		radius: 6,
		fillColor: "#ff7800",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8
	};

	$.ajax({
		url: '/data/point.geojson',
		type: 'get',
		data: {},
		error: function (xhr) {
			console.log("Can not fetch data. Please contact the administator with the information.");
		},
		success: function (response) {
			//states.push(response["features"]);
			states = JSON.parse(response)["features"];
			L.geoJSON(states, {
				pointToLayer: function (feature, latlng) {
					return L.circleMarker(latlng, geojsonMarkerOptions);
				},
				onEachFeature: onEachFeature
			}).addTo(mymap);
		}
	});
}

/*
 * desc : add legend 
 */
function addLegendBody(previousInfo, callback) {
	function generateLegendText(attr, text) {
		return '<div class="row legend-row">' + attr + '&nbsp;' 
		+ '<span>' + text + '</span></div>';
	}

	$('.legendBody').html(
		generateLegendText('<div class="circle circle-blue circle-float"></div>', frontTranslation("selfPos",defaultLang))
		+ generateLegendText('<div class="circle circle-red circle-float"></div>', frontTranslation("snakeInYear",defaultLang))
		+ generateLegendText('<div class="circle circle-light-red circle-float"></div>', frontTranslation("snakeMoreYear",defaultLang))
		+ generateLegendText('<div class="circle circle-orange circle-float"></div>', frontTranslation("rabiesInYear",defaultLang))
		+ generateLegendText('<div class="circle circle-light-orange circle-float"></div>', frontTranslation("rabiesMoreYear",defaultLang))
		+ generateLegendText('<i class="fa fa-ambulance" aria-hidden="true"></i>', frontTranslation("snakehosp",defaultLang))
		+ generateLegendText('<i class="fa fa-plus-square" aria-hidden="true"></i>', frontTranslation("rabieshosp",defaultLang))
	);
}

/**
 * desc: switch character
 */
function switchUser() {
	if($('.user').find('i').hasClass('fa-user-circle')) {
		$('.user').find('i').removeClass('fa-user-circle');
		$('.user').find('i').addClass('fa-h-square');
		$('.user-notify').css({ 'display':'block' });
	} else if ($('.user').find('i').hasClass('fa-h-square')) {
		$('.user').find('i').removeClass('fa-h-square');
		$('.user').find('i').addClass('fa-user-circle');
		$('.user-notify').css({ 'display':'none' });
	}
}

/**
 * desc: calculate the peroid of vaccine taking
 */
function calAndShowVaccPeroid(getdose) {
	
}

/**
 * desc: initialize the calendar
 */
function init_calendar() {
	var getDate = new Date();
	var crtDate = getCrtMonth(getDate) + "/" + getCrtDate(getDate) + "/" + getCrtYear(getDate);

	$('#vaccdate').datetimepicker({
		format: 'MM/DD/YYYY',
		defaultDate: crtDate
	});
	$('#reportDate').datetimepicker({
		format: 'MM/DD/YYYY',
		defaultDate: crtDate
	});
}

/*
 * desc : listener
 */
function addBtnListener() {
	$('input#searchingtext[type="text"]').on('blur' , function() {
		showDetailList();
	});
}

/**
 * desc: prepare the environment parameters
 */


/* 
 * desc : main entry 
 */
$(function() {
	async.waterfall([
		apiChecker // api checker

		// base map initialization and is dependent on apichecker
		, initialMap 

		// add button to locate your current position
		, addSelfLocBtnToMap 

		// add warning button
		, addWarningAndCameraBtnToMap

		// add legend body
		, addLegendBody
	], function (err, message) {
		if(err) { 
			console.log(err); 
		}
	});

	// other no dependent initialization
	init_calendar();

	// listener
	addBtnListener();
});