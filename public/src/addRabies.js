

function prepare_rabies_popup(dictData, exclude_key) {
	var keys = getDictionaryKeyList(dictData);
	var listInfo = "";
	for(var i = 0 ; i < keys.length; i++) {
		if(exclude_key.indexOf(keys[i]) > -1) { continue; }
		listInfo += keys[i] + ": " + dictData[keys[i]] + "<br>";
	}
	return listInfo;
}

function __add_rabies_location(data) {
	var oneyearMarkerOptions = {
		radius: 6,
		fillColor: "rgba(128,64,64,0.8)",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8
	}, moreyearMarkerOptions = {
		radius: 6,
		fillColor: "rgba(128,64,64,0.2)",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8
	};

	var crtShowLoc = getDictionaryKeyList(positionContainer["rabies"]);
	if(crtShowLoc.indexOf(data['uniqueid']) < 0) {
		var latlng, rabiesObj, marktype;
		var daydiff = dayDiff(data["datePick"],getCrtDefaultDate());

		if(daydiff > 366) {
			marktype = moreyearMarkerOptions;
		} else {
			marktype = oneyearMarkerOptions;
		}

		latlng = [data["lat"], data["long"]];
		rabiesObj = new L.circleMarker(latlng, marktype);
		rabiesObj.bindPopup(prepare_rabies_popup(data, ["uniqueid","lat","long","yearStat"]));
		positionContainer["rabies"][data['uniqueid']] = data;
		rabiesObj.addTo(mymap);
	}
}

/**
 * desc: add rabies data in one year
 */
function addRabiesData() {
	var states = [];

	getAllParams();

	$.ajax({
		url: '/api/rabiesdataapi?loc=' 
			+ String(allParams["selfLoc"]["lat"]) + ';' 
			+ String(allParams["selfLoc"]["lng"]) +'&type=rabiesall&range='
			+ String(parseInt(allParams["settings"]["range"])-1),
		type: 'get',
		data: {},
		error: function (xhr) {
			console.log("Can not fetch data. Please contact the administator with the information.");
		},
		success: function (response) {
			if(response["status"] == "success") {
				// show the location
				var allRes = response["result"]["data"];
				for(var i = 0 ; i < parseInt(response["result"]["length"]) ; i++) {
					if(allRes[i]["lat"] > 0 && allRes[i]["long"] > 0) {
						__add_rabies_location(allRes[i]);
					}
				}
				
				// add notification, check if there is risk zones
				add_notification("rabies");
			} else {
				console.log("Error: Can not fetch rabies data.");
			}
		}
	});
}