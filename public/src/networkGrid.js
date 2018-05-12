/**
 * desc: trim lon/lng into 250 meters
 * e.g.: 23.123456789 => 23.12345
 */
function trim250m(value) {
    return parseFloat(value).toFixed(5);
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
    var oriVal = trim250m(parseFloat(value));
    var rawValue = oriVal.toString();
    var over250unit = parseInt(rawValue.substring(rawValue.length - 3, rawValue.length));
    var index = Math.floor(over250unit / 250);
    var combine = rawValue.substring(0, rawValue.length-3) + grid[index];
    return combine;
}