

function prepare_rabies_popup(dictData, exclude_key) {
	var keys = getDictionaryKeyList(dictData);
	var listInfo = "";
	for(var i = 0 ; i < keys.length; i++) {
		if(exclude_key.indexOf(keys[i]) > -1) { continue; }
		listInfo += keys[i] + ": " + dictData[keys[i]] + "<br>";
	}
	return listInfo;
}

function __add_snake_location(data) {
	var oneyearMarkerOptions = {
		radius: 6,
		fillColor: "rgba(255,0,0,0.8)",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8
	}, moreyearMarkerOptions = {
		radius: 6,
		fillColor: "rgba(255,0,0,0.2)",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8
	};

	var crtShowLoc = getDictionaryKeyList(positionContainer["snake"]);
	if(crtShowLoc.indexOf(data['identifier']) < 0) {
		var latlng, snakeObj, marktype;
		var daydiff = dayDiff(data["date"],getCrtDefaultDate());

		if(daydiff > 366) {
			marktype = moreyearMarkerOptions;
		} else {
			marktype = oneyearMarkerOptions;
		}

		latlng = [data["lat"], data["long"]];
		snakeObj = new L.circleMarker(latlng, marktype);
		snakeObj.bindPopup(prepare_rabies_popup(
			data, ["conserve","lat","long","species","identifier","familyChi","family","class"]));
		positionContainer["snake"][data['identifier']] = data;
		snakeObj.addTo(mymap);
	}
}

/**
 * desc: add rabies data in one year
 */
function addSnakeData() {
	var states = [];

	getAllParams();

	$.ajax({
		url: '/api/snakedataapi?loc=' 
			+ String(allParams["selfLoc"]["lat"]) + ';' 
			+ String(allParams["selfLoc"]["lng"]) +'&type=snakeall&range='
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
						__add_snake_location(allRes[i]);
					}
				}
				
				// add notification, check if there is risk zones
				add_notification("snake");
			} else {
				console.log("Error: Can not fetch snake data.");
			}
		}
	});
}