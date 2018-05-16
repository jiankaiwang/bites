/*
 * global variables for multiple purposes
 * |- defaultLang : system default language
 * |- baseMapZoomConf : the max and min zoom
 * |- allBaseLayers : available layers added to the basemap
 * |- layerTypeName : define all layer names
 * |- run_peroid : milli-second to update the self location
 */
var defaultLang = ""; 
var baseMapZoomConf = { "min" : 3, "max" : 16 }; 
var crtLoc = [23.785273, 121.018374];
var zoomLevel = 7;
var allBaseLayers = [];
var layerTypeName = {};
var run_peroid = 3000;

/****************************************************************
 * desc : language translation
 ****************************************************************/
function getLang() {
	var pn = window.location.pathname;
	if (pn.length > 0) {
		return pn.substr(1,pn.length);
	} else {
		return "";
	}
}
defaultLang = getLang();

/****************************************************************
 * base map issue
 ****************************************************************/
/*
 * desc : design base map layer
 */ 
var baseMapUri ={
	"osm" : {
		"outdoor" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
		"grey" :  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
	}
}

layerTypeName = {
	"osm" : {
		"outdoor" : { "zh_TW" : "一般", "en" : "Outdoor" },
		"grey" : { "zh_TW" : "灰階", "en" : "Gray" }
	}
} 
 
var attributionInfo = {
	"osm" : 'Mapdata &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>, Bites &copy; 2017'
};

var outdoorLayer = L.tileLayer(
	baseMapUri["osm"]["outdoor"], 
	{ attribution: attributionInfo["osm"], maxZoom: baseMapZoomConf["max"], minZoom: baseMapZoomConf["min"] }
), greyLayer = L.tileLayer(
	baseMapUri["osm"]["grey"], 
	{ attribution: attributionInfo["osm"], maxZoom: baseMapZoomConf["max"], minZoom: baseMapZoomConf["min"] }
);	

allBaseLayers = [outdoorLayer, greyLayer];

/****************************************************************
 * language translation
 ****************************************************************/
/**
 * desc : get the translation
 */
function frontTranslation(item, lang) {
	return front_translation[item][lang];
}

/**
 * language translation
 */
var front_translation = {
	"selfLocBtn": { "en": "Current Position", "zh_TW": "定位" }
	, "selfPos": { "en": "Current Position", "zh_TW": "現在位置" }
	, "warningBtn": { "en": "Warning Messages", "zh_TW": "警示訊息" }
	, "imageBtn": { "en": "Image Recognition", "zh_TW": "影像辨識" }
	, "hospBtn": { "en": "Find Nearest Hospital", "zh_TW": "尋找最近就醫地點" }
	, "snakeInYear": { "en": "Snake (< 1yr)", "zh_TW": "1年內毒蛇出沒" }
	, "snakeMoreYear": { "en": "Snake (> 1yr)", "zh_TW": "歷史毒蛇出沒" }
	, "rabiesInYear": { "en": "Radies Animal (< 1yr)", "zh_TW": "1年內狂犬病動物出沒" }
	, "rabiesMoreYear": { "en": "Radies Animal (> 1yr)", "zh_TW": "歷史狂犬病動物出沒" }
	, "snakehosp": {'en':'Anti-serum Hosp', "zh_TW":'有蛇毒抗血清醫院'}
	, "rabieshosp": {'en':'Rabies Vaccine Hosp', "zh_TW":'狂犬病疫苗醫院'}
	, "tutorialInfo": {'en':'Show Tutorial', "zh_TW":'顯示導覽'}
};