var sysconfig = require("../configure/sysconfig");

/**
 * desc: trim lon/lng into 250 meters
 * e.g.: 23.123456789 => 23.12345
 */
function floatFixed5(value) {
    return parseFloat(value).toFixed(5);
}

function setGridUnit() {
    var gridDict = {};
    cnt = parseInt(1000.0 / parseFloat(sysconfig.params["grid_meter"]));
    for(var i = 0 ; i < cnt ; i++) {
        gridDict[i] = parseInt(sysconfig.params["grid_meter"]) * i;
    }
    return gridDict;
}

/**
 * value: 121.55251
 * ret: grid
 * index: 250
 * |- 0: 0-249
 * |- 1: 250-499 <- 251
 * |- 2: 500-749
 * |- 3: 750-999
 * grid: 121.55250
 */
function getGridIndex(value) {
    var grid = {0:"000",1:"250",2:"500",3:"750"};
    var oriVal = floatFixed5(parseFloat(value));
    var rawValue = oriVal.toString();
    var overunit = parseInt(rawValue.substring(rawValue.length - 3, rawValue.length));
    var index = Math.floor(overunit / parseFloat(sysconfig.params["grid_meter"]));
    var combine = rawValue.substring(0, rawValue.length-3) + grid[index];
    return combine;
}

/**
 * @param {*} lat 
 * @param {*} lng 
 * @param {*} zone : unit is meter
 * @debug : uncomment the code `__dev_grid(latlng);` on currentPosition.js script
 */
function getGridList(lat, lng, zone) {
    var adjustzone = parseInt(zone / 1000.0);
    var gridCount = parseFloat(zone) / parseFloat(sysconfig.params["grid_meter"]);
    var meterunit = parseFloat(sysconfig.params["grid_meter"]) / 100000.0;
    var startLat = parseFloat(getGridIndex(lat)) - meterunit * (gridCount+2*adjustzone) / 2.0;
    var startLng = parseFloat(getGridIndex(lng)) - meterunit * (gridCount+2*adjustzone) / 2.0;
    var ttlGridList = [];
    // +1 : includes current location
    var gridLat = startLat;
    var gridLng = startLng;
    for(var i = 0 ; i < gridCount*2 + 1 + 1 * (-1*adjustzone); i++) {
        gridLat = startLat + meterunit * i;
        for(var j = 0 ; j < gridCount*2 + 1 + 1 * (-1*adjustzone); j++) {
            gridLng = startLng + meterunit * j;
            ttlGridList.push(String(floatFixed5(gridLat)) + "-" + String(floatFixed5(gridLng)));
        }
        gridLng = startLng;
    }
    return ttlGridList;
}


/**
 * 
 */
exports.getGridIndex = getGridIndex;
exports.getGridList = getGridList;