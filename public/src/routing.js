/**
 * desc: the front-end script to add paths into the mymap
 */

var __locList = [];

// remove all layers on mymap
function removeAllLayersFromMap() {
    if(__locList.length > 0) {
        for(var i = 0 ; i < __locList.length ; i++) {
            mymap.removeLayer(__locList[i]);
        }
    }
}

/* 
 * desc: add path from osrm
 * para: 
 * |- beginning: ["lon(x)","lat(y)"]
 * |- ending: ["lon(x)", "lat(y)"]
 * e.g.: addRoutingPath([121.522685,25.042796],[121.532535,25.033178])
 */ 
function addRoutingPath(beginning, ending) {  
    var routeService = "/api/routeapi?loc=" + 
		'' + beginning[0] + ',' + beginning[1] +
		';' + ending[0] + ',' + ending[1];
	
	$.ajax({
		type: "GET",
		url: routeService,
		data: "",
		contentType: "application/x-www-form-urlencoded",
		datatype: 'json',
		timeout: 10*1000,
		beforeSend: function() {},
		success: function (msg) {
			// clear the current route
			removeAllLayersFromMap();
			
            // start to show the current route
            __showRoutePath(msg);
            setCrtLocOnMap();
		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log('Can not route the path.');
		}
	});
}

 /*
 * desc : show the whole route path
 */
function __showRoutePath(data) {
    // add the information
    __sumName = data["routes"][0]["legs"][0]["summary"];
    __allLine = [];

    // add to the geojson collection
    __geoLine = [];
    
    // add each part of route
    var allPoints = data["routes"][0]["legs"][0]["steps"];
    
    // for prepare a line
    var prepareLineFlag = 0;
    var startPoint = null;
    var endPoint = null;
    var lineRange = null;
    var locInfo = ["",""];
    
    for(var i = 0 ; i < allPoints.length ; i++) {    
        for(var j = 0 ; j < allPoints[i]["intersections"].length ; j++) {
            switch(prepareLineFlag) {
                case 0:
                    // start point
                    startPoint = new L.LatLng(allPoints[i]["intersections"][j]["location"][1], allPoints[i]["intersections"][j]["location"][0]);
                    if(getDictionaryKeyList(allPoints[j]).indexOf("name") > -1) {
                        locInfo[0] = allPoints[j]["name"];
                    } else {
                        locInfo[0] = "";
                    }
                    
                    // set the flag to the end point
                    prepareLineFlag = 1;
                    break;
                case 1:
                    // end point
                    endPoint =  new L.LatLng(allPoints[i]["intersections"][j]["location"][1], allPoints[i]["intersections"][j]["location"][0]);
                    if(getDictionaryKeyList(allPoints[j]).indexOf("name") > -1) {
                        locInfo[1] = allPoints[j]["name"];
                    } else {
                        locInfo[1] = "";
                    }
                    
                    // draw the line
                    lineRange = [startPoint, endPoint];
                    var routePolyline = new L.Polyline(lineRange, {
                        //className: __getRouteClass(),
                        color: systemEffect["routingTip"]["color"],
                        weight: systemEffect["routingTip"]["weight"],
                        opacity: systemEffect["routingTip"]["opacity"],
                        smoothFactor: systemEffect["routingTip"]["smoothFactor"]
                    });
                    __locList.push(routePolyline);
                    routePolyline.addTo(mymap);
                    
                    // the current end point is the next start point
                    startPoint = endPoint;
                    endPoint = null;
                    locInfo[0] = locInfo[1];
                    break;
            }
        }  // inner for-loop
    }  // outer for-loop
}