/*
 * global settings
 * |- mymap : base map object
 */
var mymap;
var positionContainer = {
	"hospital":[],
	"snake":{},
	"rabies":{}
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

function prepare_popup(hosp_type, dictData, exclude_key) {
	var keys = getDictionaryKeyList(dictData);
	var listInfo = "";

	switch(hosp_type) {
		default:
		case 1:
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
		case 2:
			for(var i = 0 ; i < keys.length; i++) {
				if(exclude_key.indexOf(keys[i]) > -1) { continue; }
				if(keys[i] == "醫事機構代碼") {
					listInfo += "看診時段: <a href='http://www.nhi.gov.tw/QueryN/Query3_Detail.aspx?HospID=" 
					+ dictData[keys[i]] + "' target=_blank><span class='text-color-blue'>網頁連結</span></a><br>";
				} else {
					listInfo += keys[i] + ": " + dictData[keys[i]] + "<br>";
				}
			}
			return listInfo;
	}
}

function checkHospExisting(hosp_code) {
	for(var i = 0 ; i < positionContainer["hospital"].length ; i++) {
		if(String(positionContainer["hospital"][i]["options"]["code"]) == String(hosp_code)) {
			return true;
		}
	}
	return false;
}


function add_hosp_mark(hosp_type, hosp_info) {
	var __hospIcon = null, hosp_code = null;

	if(hosp_type == 1) {
		__hospIcon = L.AwesomeMarkers.icon({
			icon: 'ambulance',
			prefix: 'fa',
			markerColor: 'green'
		});
		hosp_code = hosp_info["十碼章"];
	} else if (hosp_type == 2) {
		__hospIcon = L.AwesomeMarkers.icon({
			icon: 'plus-square',
			prefix: 'fa',
			markerColor: 'green'
		});
		hosp_code = hosp_info["醫事機構代碼"];
	}

	if(checkHospExisting(hosp_code)) { return ; }

	var hospLoc = [hosp_info["緯度"], hosp_info["經度"]];
	customMarker = L.Marker.extend({
		options: { code: "hosp_code" }
	});
	var myMarker = new customMarker(hospLoc, { 
		icon: __hospIcon
		, code: hosp_code
	});
	myMarker.bindPopup(prepare_popup(hosp_type, hosp_info, ["經度","緯度","區域別"]));
	positionContainer["hospital"].push(myMarker.addTo(mymap));
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
	var getDate = $('#vaccdate').find("input").val();
	var getVaccDay = paramEffect["vaccine"]["dosetype"];
	var initDose = parseInt(getdose);
	var addDate = null;

	addDate = addDays(new Date(getDate), 0);
	$('#vaccine-' + getdose).datetimepicker({
		format: 'MM/DD/YYYY',
		date: addDate
	});
	for(var i = 1 ; i < initDose + 1 ; i++) {
		$('#vaccine-' + i).datetimepicker({
			format: 'MM/DD/YYYY',
			date: addDate
		});
	}
	for(var i = initDose + 1; i <= getVaccDay.length ; i++) {
		addDate = addDays(new Date(addDate), parseInt(getVaccDay[i-1]));
		//console.log(parseInt(getVaccDay[i-1]));
		$('#vaccine-' + i).datetimepicker({
			format: 'MM/DD/YYYY',
			date: addDate
		});
	}
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

	$('#enableLegend').find('input').on('change', function() { 
		// fetch latest setting
		getAllParams();

		if(allParams["settings"]["legend"]) {
			$('.legend').css({ 'display': 'block' });
		} else {
			$('.legend').css({ 'display': 'none' });
		}
	});

	$('#rangeslider').on('change', function() { 
		getAllParams();

		if(getDictionaryLength(allParams["selfLoc"]) < 1) {
			checkSelfLoc();
			return ;
		}
		// change radius
		drawRange(allParams["selfLoc"]);
		// get warning message
		__set_crt_latlng(allParams["selfLoc"], __selfIcon);
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
		//setMapView(getAllParams.getSelfLoc(), systemEffect.setViewLevel);
		setMapView(getAllParams.getSelfLoc());
	}
}

function setMapView(latlng) {
	//mymap.setView(latlng, viewlevel);
	mymap.setView(latlng, mymap.getZoom());
}

function routeSnakeHosp() {
	// fetch latest setting
	getAllParams();

	if(getDictionaryKeyList(allParams["selfLoc"]).length < 1) {
		checkSelfLoc();
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

function routeRabiesVaccHosp() {
	// fetch latest setting
	getAllParams();

	// check current position
	if(getDictionaryKeyList(allParams["selfLoc"]).length < 1) {
		checkSelfLoc();
		console.log("you have to position yourself first");
		return ;
	}

	$.ajax({
		url: '/api/nearesthospital?loc=' + allParams["selfLoc"]["lng"] + ';' + allParams["selfLoc"]["lat"] + '&hosp=2',
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
					add_hosp_mark(2, response["result"][i]);
					// routing the map
					addRoutingPath(
						response["result"][i]["醫事機構代碼"]
						,(i+11)
						,[allParams["selfLoc"]["lng"], allParams["selfLoc"]["lat"]]
						,[response["result"][i]["經度"], response["result"][i]["緯度"]]
					)
				}
			} else {
				console.log("API hosp=2 response but it is failure status");
				$('#hospInfo').html('<i class="fa fa-exclamation-triangle small-ubtn" aria-hidden="true"></i>');
			}
		}
	});
}

function add_notification(warningType) {
	function __ret_msg(csstype, message, latlng) {
		return('<div class="enlarge-row">'
		+ '<button type="button" class="btn btn-default btn-sm full-btn" onclick="javascript: setMapView([' + latlng + '])">'
		+ '<div class="col-xs-2 col-md-2 no-padding-right no-padding-left">'
		+ '<div class="circle ' + csstype + ' circle-float"></div>'
		+ '</div>'
		+ '<div class="col-xs-10 col-md-10 no-padding-right no-padding-left">'
		+ message
		+ '</div>'
		+ '</button></div>');
	}

	if(warningType == "rabies") {
		var content = "";
		var allData = positionContainer["rabies"];
		var allKeys = getDictionaryKeyList(allData);
		if(allKeys.length > 0) {
			for(var i = 0 ; i < allKeys.length ; i++) {
				var daydiff = dayDiff(allData[allKeys[i]]["datePick"], getCrtDefaultDate());
				if(daydiff < 366) {
					content += __ret_msg(
						'circle-orange', 
						"檢出" + allData[allKeys[i]]["Animal"] + " (" + allData[allKeys[i]]["datePick"] + ")",
						[allData[allKeys[i]]["lat"], allData[allKeys[i]]["long"]]
					);
				} else {
					content += __ret_msg(
						'circle-light-orange', 
						"檢出" + allData[allKeys[i]]["Animal"] + " (" + allData[allKeys[i]]["datePick"] + ")",
						[allData[allKeys[i]]["lat"], allData[allKeys[i]]["long"]]
					);
				}
			}

			// show warning tip
			notifyWarning();
		} else {
			content += __ret_msg('circle-blank', "附近無檢出陽性狂犬病動物", 
			[allParams["selfLoc"]["lat"], allParams["selfLoc"]["lng"]]);
		}
		$('#warning-rabies').html(content);
	} else {
		var content = "";
		var allData = positionContainer["snake"];
		var allKeys = getDictionaryKeyList(allData);
		if(allKeys.length > 0) {
			for(var i = 0 ; i < allKeys.length ; i++) {
				var daydiff = dayDiff(allData[allKeys[i]]["date"], getCrtDefaultDate());
				if(daydiff < 366) {
					content += __ret_msg(
						'circle-red', 
						"發現" + allData[allKeys[i]]["speciesChi"] + " (" + allData[allKeys[i]]["date"] + ")",
						[allData[allKeys[i]]["lat"], allData[allKeys[i]]["long"]]
					);
				} else {
					content += __ret_msg(
						'circle-light-red', 
						"發現" + allData[allKeys[i]]["speciesChi"] + " (" + allData[allKeys[i]]["date"] + ")",
						[allData[allKeys[i]]["lat"], allData[allKeys[i]]["long"]]
					);
				}
			}

			// show warning tip
			notifyWarning();
		} else {
			content += __ret_msg('circle-blank', "附近無發現有毒毒蛇", 
			[allParams["selfLoc"]["lat"], allParams["selfLoc"]["lng"]]);
		}
		$('#warning-snake').html(content);
	}
}

function notifySelfPosition() {
	getAllParams();
	var selfLocCnt = getDictionaryLength(allParams["selfLoc"]);
	if(selfLocCnt < 1) {
		d3.select("#selfposbtn").style("color", "black")
			.transition().delay(1000).style("color", "red")
			.transition().delay(500).style("color", "black")
			.transition().delay(1000).style("color", "red")
			.transition().delay(500).style("color", "black")
			.transition().delay(1000).style("color", "red")
			.transition().delay(500).style("color", "black");
		setTimeout(function() { notifySelfPosition(); }, 5000);
	}
}

function notifyWarning() {
	d3.select("#warningInfo").style("color", "black")
		.transition().delay(1000).style("color", "orange")
		.transition().delay(500).style("color", "black")
		.transition().delay(1000).style("color", "orange")
		.transition().delay(500).style("color", "black")
		.transition().delay(1000).style("color", "orange")
		.transition().delay(500).style("color", "black");
}

function checkSelfLoc() {
	// fetch latest setting
	getAllParams();

	if(getDictionaryKeyList(allParams["selfLoc"]).length < 1) {
		notifySelfPosition();
	}
}

/**
 * desc: preload the searching text
 */
function preloadSearch(data) {
	$("#searchingtext").val(data);
	pinDetailList();
	fetchQA();
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
	notifySelfPosition();
});