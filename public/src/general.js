/*
 * global settings
 * |- mymap : base map object
 */
var mymap;
var allParams = {
	selfLoc: []
	, selfMode: ""
	, settings: {
		positioning: ""
		, range: 1
		, message: true
		, legend: true
	}
	, vaccine: {
		date: "04/27/2018"
		, dosetype: 1
		, notifyemail: ""
	}
	, report: {
		date: "04/27/2018"
		, location: ""
		, areatype: "mountain"
		, reportemail: ""
	}
};
var paramEffect = {
	settings: {
		positioning: { "T": 10, "F" : 30 }		// unit is second
		, range: {0:0, 1:500, 2:1000}			// unit is meter
	}
	, vaccine: {
		dosetype: [0, 3, 7, 14, 21, 28]			// unit is day
	}
};
var systemEffect = {
	hospital: {
		finding_min: 3
	}
	, warning: {
		notify_min: 10
	}
	, setViewLevel: 15
	, routingTip: {
		color: 'blue',
		weight: 8,
		opacity: '0.6',
		smoothFactor: 3
	}
	, routingTip2: {
		color: 'blue',
		weight: 4,
		opacity: '0.3',
		smoothFactor: 3
	}
};

var positionContainer = {
	"hospital":[],
	"snake":[],
	"rabies":[]
};

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

function prepare_popup(dictData, exclude_key) {
	var keys = getDictionaryKeyList(dictData);
	var listInfo = "";
	for(var i = 0 ; i < keys.length; i++) {
		if(exclude_key.indexOf(keys[i]) > -1) { continue; }
		if(keys[i] == "十碼章") {
			listInfo += "看診時段: <a href='http://www.nhi.gov.tw/QueryN/Query3_Detail.aspx?HospID=" 
			+ dictData[keys[i]] + "' target=_blank><span class='text-color-blue'>網頁連結</span></a><br>";
		} else {
			listInfo += keys[i] + ": " + dictData[keys[i]] + "<br>";
		}
	}
	return listInfo;
}

function add_hosp_mark(hosp_type, hosp_info) {
	var __hospIcon = null;

	if(hosp_type == 1) {
		__hospIcon = L.AwesomeMarkers.icon({
			icon: 'ambulance',
			prefix: 'fa',
			markerColor: 'green'
		});
	} else if (hosp_type == 2) {
		__hospIcon = L.AwesomeMarkers.icon({
			icon: 'plus',
			prefix: 'fa',
			markerColor: 'green'
		});
	}

	var hospLoc = [hosp_info["緯度"], hosp_info["經度"]];
	var hospObj = new L.marker(hospLoc, {icon: __hospIcon});
	hospObj.bindPopup(prepare_popup(hosp_info, ["經度","緯度","區域別"]));
	positionContainer["hospital"].push(hospObj.addTo(mymap));
}

/*
 * desc : add legend 
 */
function addLegendBody(previousInfo, callback) {
	function retsnakeInYear() { return '<div class="circle circle-red circle-float"></div>'; }
	addLegendBody.retsnakeInYear = retsnakeInYear;
	function retsnakeMoreYear() { return '<div class="circle circle-light-red circle-float"></div>'; }
	addLegendBody.retsnakeMoreYear = retsnakeMoreYear;
	function retrabiesInYear() { return '<div class="circle circle-orange circle-float"></div>'; }
	addLegendBody.retrabiesInYear = retrabiesInYear;
	function retrabiesMoreYear() { return '<div class="circle circle-light-orange circle-float"></div>'; }
	addLegendBody.retrabiesMoreYear = retrabiesMoreYear;
	function retsnakehosp() { return '<i class="fa fa-ambulance" aria-hidden="true"></i>'; }
	addLegendBody.retsnakehosp = retsnakehosp;
	function retrabieshosp() { return '<i class="fa fa-plus-square" aria-hidden="true"></i>'; }
	addLegendBody.retrabieshosp = retrabieshosp;


	function generateLegendText(attr, text) {
		return '<div class="row legend-row">' + attr + '&nbsp;' 
		+ '<span>' + text + '</span></div>';
	}

	$('.legendBody').html(
		generateLegendText('<div class="circle circle-blue circle-float"></div>', frontTranslation("selfPos",defaultLang))
		+ generateLegendText(retsnakeInYear(), frontTranslation("snakeInYear",defaultLang))
		+ generateLegendText(retsnakeMoreYear(), frontTranslation("snakeMoreYear",defaultLang))
		+ generateLegendText(retrabiesInYear(), frontTranslation("rabiesInYear",defaultLang))
		+ generateLegendText(retrabiesMoreYear(), frontTranslation("rabiesMoreYear",defaultLang))
		+ generateLegendText(retsnakehosp(), frontTranslation("snakehosp",defaultLang))
		+ generateLegendText(retrabieshosp(), frontTranslation("rabieshosp",defaultLang))
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
	// update the dose type
	allParams["vaccine"]["dosetype"] = getdose;
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

function legendScaled() {
	if(! $(".legend").hasClass('legend-none')) {
		if($(".legend").hasClass('legend-small')) {
			// to the origin scale
			$(".legendTip").addClass('display-none');			
			$(".legend").animate({
				width: '170px',
				height: '154px'
			},'slow');
			$(".legend").removeClass('legend-small');
			$(".legend").addClass('legend-origin');
			$(".legendBody").removeClass('display-none');
		} else {
			// to the small scale			
			$(".legend").animate({
				width: '50px',
				height: '50px'
			},'slow');
			$(".legend").removeClass('legend-origin');
			$(".legend").addClass('legend-small');
			$(".legendBody").addClass('display-none');
			$(".legendTip").removeClass('display-none');
		}
	}
}

function setCrtLocOnMap() {
	if(getDictionaryLength(getAllParams.getSelfLoc()) > 0) {
		mymap.setView(getAllParams.getSelfLoc(), systemEffect.setViewLevel);
	}
}

function routeSnakeHosp() {
	// fetch latest setting
	getAllParams();

	if(getDictionaryKeyList(allParams["selfLoc"]).length < 1) {
		console.log("you have to position yourself first");
		return ;
	}

	$.ajax({
		url: '/api/nearesthospital?loc=' + allParams["selfLoc"]["lng"] + ';' + allParams["selfLoc"]["lat"] + '&hosp=1',
		type: 'get',
		data: {},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log(xhr.status + " " + thrownError + ". Cannot connect to /api/nearesthospital.");
			$('#hospInfo').html('<i class="fa fa-exclamation-triangle small-ubtn" aria-hidden="true"></i>');
		},
		success: function (response) {
			if(response["status"] == "success") {
				for(var i = 0 ; i < response["result"].length ; i++) {
					// add to the hosp list and add to the map
					add_hosp_mark(1, response["result"][i]);
					// routing the map
					addRoutingPath(
						response["result"][i]["十碼章"]
						,(i+1)
						,[allParams["selfLoc"]["lng"], allParams["selfLoc"]["lat"]]
						,[response["result"][i]["經度"], response["result"][i]["緯度"]]
					)
				}
			} else {
				console.log("API hosp=1 response but it is failure status");
				$('#hospInfo').html('<i class="fa fa-exclamation-triangle small-ubtn" aria-hidden="true"></i>');
			}
		}
	});
}

function notifySelfPosition() {
	d3.select("#selfposbtn").style("color", "black")
		.transition().delay(750).style("color", "red")
		.transition().delay(750).style("color", "black")
		.transition().delay(750).style("color", "red")
		.transition().delay(750).style("color", "black");
}

function checkSelfLoc() {
	// fetch latest setting
	getAllParams();

	if(getDictionaryKeyList(allParams["selfLoc"]).length < 1) {
		notifySelfPosition();
	}
}

/**
 * desc: prepare the environment parameters
 */
function getAllParams() {
	function getSelfLoc() {
		if(selfLoc.length > 0) { return selfLoc[0]["_latlng"]; }
		else { return({}); }
	}
	getAllParams.getSelfLoc = getSelfLoc;

	function getSelfMode() { 
		if($('.user').find('i').hasClass('fa-user-circle')) { return "user"; } 
		else { return "medical"; } 
	}
	getAllParams.getSelfMode = getSelfMode;

	function getPositioning() {
		if($('#positioning').find('input').prop('checked')) { return true; }
		else { return false; }
	}
	getAllParams.getPositioning = getPositioning;

	function searchRange() {
		return(parseInt($('#rangeslider').val()));
	}
	getAllParams.searchRange = searchRange;

	function messagePush() {
		if($('#messaging').find('input').prop('checked')) { return true; }
		else { return false; }
	}
	getAllParams.messagePush = messagePush;

	function legendPush() {
		if($('#enableLegend').find('input').prop('checked')) { return true; }
		else { return false; }
	}
	getAllParams.legendPush = legendPush;

	function getVaccDate() {
		return $('#vaccdate').find('input').val();
	}
	getAllParams.getVaccDate = getVaccDate;

	function getDoseType() {
		// notice this action is active button
		if(allParams["vaccine"]["dosetype"] < 1) { return -1; } 
		else { return allParams["vaccine"]["dosetype"]; }
	}
	getAllParams.getDoseType = getDoseType;

	function getNotifyEmail() {
		if($('#vaccnotify_email').val().length < 1) { return ""; } 
		else { return($('#vaccnotify_email').val()); }
	}
	getAllParams.getNotifyEmail = getNotifyEmail;

	function getReportDate() {
		return $('#reportDate').find('input').val();
	}
	getAllParams.getReportDate = getReportDate;

	function getReportArea() {
		return parseInt($('#area').val());
	}
	getAllParams.getReportArea = getReportArea;
	
	function getReportEmail() {
		if($('#reportman_email').val().length < 1) { return ""; } 
		else { return($('#reportman_email').val()); }
	}
	getAllParams.getReportEmail = getReportEmail;
	
	allParams = {
		selfLoc: getSelfLoc()
		, selfMode: getSelfMode(0)
		, settings: {
			positioning: getPositioning()
			, range: searchRange()
			, message: messagePush()
			, legend: legendPush()
		}
		, vaccine: {
			date: getVaccDate()
			, dosetype: -1
			, notifyemail: getNotifyEmail()
		}
		, report: {
			date: getReportDate()
			, location: ""
			, areatype: getReportArea()
			, reportemail: getReportEmail()
		}
	}
}


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
	init_popup();

	// listener
	addBtnListener();

	// initialization
	getAllParams();
});