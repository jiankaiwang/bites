

function prepare_rabies_popup(dictData, exclude_key) {
	var keys = getDictionaryKeyList(dictData);
	var listInfo = "";
	for(var i = 0 ; i < keys.length; i++) {
		if(exclude_key.indexOf(keys[i]) > -1) { continue; }
		listInfo += keys[i] + ": " + dictData[keys[i]] + "<br>";
	}
	return listInfo;
}

function add_notification(warningType, message) {
    $('#warning-body-content').append(
        '<button type="button" class="btn btn-default btn-sm full-btn" >'
        + '<div class="col-xs-2 col-md-2 no-padding-right no-padding-left">'
        + '<div class="circle circle-blank circle-float"></div>'
        + '</div>'
        + '<div class="col-xs-10 col-md-10 no-padding-right no-padding-left">'
        + message
        + '</div>'
        + '</button>'
    );
}

/**
 * desc: add rabies data in one year
 */
function addRabiesInOneYear() {
	/*function onEachFeature(feature, layer) {
		// does this feature have a property named popupContent?
		if (feature.properties) {
			layer.bindPopup(prepareProperity(feature.properties));
		}
	}*/

	var states = [];

	var oneyearMarkerOptions = {
		radius: 6,
		fillColor: "#ff7800",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8
	}, moreyearMarkerOptions = {
		radius: 6,
		fillColor: "rgba(255,127,39,0.2)",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8
	};

	$.ajax({
		url: '/data/rabies_clean.json',
		type: 'get',
		data: {},
		error: function (xhr) {
			console.log("Can not fetch data. Please contact the administator with the information.");
		},
		success: function (response) {
            for(var i = 0 ; i < response.length ; i++) {
                if(response[i]["lat"] > 0 && response[i]["lat"] > 0) {
                    var latlng, rabiesObj;
                    if(parseInt(response[i]["yearStat"]) < 2018) {
                        latlng = [response[i]["lat"], response[i]["long"]];
                        rabiesObj = new L.circleMarker(latlng, moreyearMarkerOptions);
                        rabiesObj.bindPopup(prepare_rabies_popup(response[i], ["uniqueid","lat","long","yearStat"]));
                        positionContainer["rabies"].push(rabiesObj.addTo(mymap));
                    } else {
                        latlng = [response[i]["lat"], response[i]["long"]];
                        rabiesObj = new L.circleMarker(latlng, oneyearMarkerOptions);
                        rabiesObj.bindPopup(prepare_rabies_popup(response[i], ["uniqueid","lat","long","yearStat"]));
                        positionContainer["rabies"].push(rabiesObj.addTo(mymap));
                    }
                }
            }

            // check if there is risk zones
            add_notification(0, '附近無狂犬病動物出沒');
		}
	});
}